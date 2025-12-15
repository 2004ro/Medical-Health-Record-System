pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO = 'your-dockerhub-username'
        SERVICE_NAME = 'mhrs-patient-service'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_IMAGE = "${DOCKER_HUB_REPO}/${SERVICE_NAME}:${IMAGE_TAG}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['DEV', 'STAGING', 'PROD'], description: 'Target environment')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip running tests')
        booleanParam(name: 'PUSH_TO_DOCKERHUB', defaultValue: false, description: 'Push image to Docker Hub')
    }



    stages {
        stage('1. Checkout') {
            steps {
                echo "======== Checking out source code ========"
                checkout scm
                sh 'git log --oneline -5'
            }
        }

        stage('2. Build with Maven') {
            steps {
                echo "======== Building application with Maven ========"
                dir('patient-service') {
                    sh 'mvn clean compile'
                }
            }
        }

        stage('3. Unit Tests') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                echo "======== Running unit tests ========"
                dir('patient-service') {
                    sh 'mvn test'
                }
            }
        }

        stage('4. Code Quality Analysis') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                echo "======== Performing code quality checks ========"
                dir('patient-service') {
                    sh 'mvn verify'
                }
            }
        }

        stage('5. Package Application') {
            steps {
                echo "======== Packaging application ========"
                dir('patient-service') {
                    sh 'mvn package -DskipTests'
                }
            }
        }

        stage('6. Build Docker Image') {
            steps {
                echo "======== Building Docker image ========"
                dir('patient-service') {
                    script {
                        // Build the application image
                        sh "docker build -t ${SERVICE_NAME}:${IMAGE_TAG} ."
                        sh "docker tag ${SERVICE_NAME}:${IMAGE_TAG} ${SERVICE_NAME}:latest"
                        
                        // Only tag for Docker Hub if we're going to push
                        if (params.PUSH_TO_DOCKERHUB) {
                            sh "docker tag ${SERVICE_NAME}:${IMAGE_TAG} ${DOCKER_IMAGE}"
                            sh "docker tag ${SERVICE_NAME}:${IMAGE_TAG} ${DOCKER_HUB_REPO}/${SERVICE_NAME}:latest"
                        }
                    }
                }
            }
        }

        stage('7. Push to Docker Hub') {
            when {
                allOf {
                    branch 'main'
                    expression { params.PUSH_TO_DOCKERHUB }
                }
            }
            steps {
                echo "======== Pushing Docker image to Docker Hub ========"
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                        docker push ${DOCKER_IMAGE}
                        docker push ${DOCKER_HUB_REPO}/${SERVICE_NAME}:latest
                        docker logout
                    '''
                }
            }
        }

        stage('8. Deploy to ${ENVIRONMENT}') {
            steps {
                echo "======== Deploying to ${ENVIRONMENT} environment ========"
                script {
                    if (params.ENVIRONMENT == 'DEV') {
                        sh '''
                            # Stop and remove existing containers
                            docker-compose -f docker-compose.yml down || true
                            
                            # Start services
                            docker-compose -f docker-compose.yml up -d
                            
                            # Wait for services to be ready
                            echo "Waiting for services to start..."
                            sleep 15
                        '''
                    } else if (params.ENVIRONMENT == 'STAGING') {
                        echo "Deploying to staging environment"
                        // Add staging deployment commands
                    } else if (params.ENVIRONMENT == 'PROD') {
                        echo "Deploying to production environment"
                        // Add production deployment commands
                    }
                }
            }
        }

        stage('9. Health Check') {
            steps {
                echo "======== Performing health checks ========"
                script {
                    sh '''
                        echo "Checking service health..."
                        for i in {1..30}; do
                            if curl -f http://localhost:8082/api/v1/patients/health/check 2>/dev/null; then
                                echo "✓ Service is healthy!"
                                exit 0
                            fi
                            echo "Attempt $i/30 - Service not ready yet, retrying..."
                            sleep 2
                        done
                        echo "✗ Health check failed after 30 attempts"
                        exit 1
                    '''
                }
            }
        }

        stage('10. Smoke Tests') {
            steps {
                echo "======== Running smoke tests ========"
                script {
                    sh '''
                        echo "Running basic API smoke tests..."
                        
                        # Test 1: Check if API is responding
                        echo "Test 1: API Response Check"
                        curl -f http://localhost:8082/api/v1/patients || exit 1
                        
                        echo "✓ All smoke tests passed!"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "======== Pipeline completed ========"
            
            // Archive artifacts
            script {
                dir('patient-service') {
                    archiveArtifacts artifacts: 'target/*.jar', allowEmptyArchive: true, fingerprint: true
                }
            }
            
            // Clean up Docker images to save space (keep latest)
            sh '''
                echo "Cleaning up old Docker images..."
                docker image prune -f || true
            '''
        }

        success {
            echo "======== ✓ Pipeline SUCCESS ========"
            echo "Build #${BUILD_NUMBER} completed successfully!"
            echo "Image: ${SERVICE_NAME}:${IMAGE_TAG}"
            // Send success notification (email, Slack, etc.)
        }

        failure {
            echo "======== ✗ Pipeline FAILED ========"
            echo "Build #${BUILD_NUMBER} failed. Please check the logs."
            // Send failure notification
        }

        unstable {
            echo "======== ⚠ Pipeline UNSTABLE ========"
            echo "Build #${BUILD_NUMBER} is unstable."
        }
    }
}
