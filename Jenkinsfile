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

    tools {
        maven 'Maven3'
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
                        // Using shell commands instead of docker plugin for better compatibility
                        sh "docker build -t ${SERVICE_NAME}:${IMAGE_TAG} ."
                        sh "docker tag ${SERVICE_NAME}:${IMAGE_TAG} ${SERVICE_NAME}:latest"
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
                script {
                    // Using shell commands for Docker Hub push
                    // Note: This requires the 'dockerhub-credentials' to be configured in Jenkins
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        
                        // Tag image with repo name explicitly
                        sh "docker tag ${SERVICE_NAME}:${IMAGE_TAG} ${DOCKER_HUB_REPO}/${SERVICE_NAME}:${IMAGE_TAG}"
                        sh "docker tag ${SERVICE_NAME}:${IMAGE_TAG} ${DOCKER_HUB_REPO}/${SERVICE_NAME}:latest"
                        
                        sh "docker push ${DOCKER_HUB_REPO}/${SERVICE_NAME}:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_HUB_REPO}/${SERVICE_NAME}:latest"
                    }
                }
            }
        }

        stage('8. Deploy to DEV') {
            steps {
                echo "======== Deploying to ${ENVIRONMENT} environment (Docker Compose v2) ========"
                script {
                    if (params.ENVIRONMENT == 'DEV') {
                        sh '''
                            echo "Deploying using manual docker commands..."
                            
                            # Create network if not exists
                            docker network create mhrs-network || true
                            
                            # Clean up old containers
                            docker rm -f mhrs-patient-service mhrs-mysql || true
                            
                            # Start MySQL
                            echo "Starting MySQL..."
                            docker run -d \\
                                --name mhrs-mysql \\
                                --network mhrs-network \\
                                -e MYSQL_ROOT_PASSWORD=root123 \\
                                -e MYSQL_DATABASE=medical_health_record \\
                                -e MYSQL_USER=mhrs_user \\
                                -e MYSQL_PASSWORD=mhrs_password \\
                                -p 3306:3306 \\
                                -v mysql-data:/var/lib/mysql \\
                                mysql:8.0
                                
                            # Wait for MySQL to be ready (simple sleep as healthcheck logic is complex in shell)
                            echo "Waiting for MySQL to initialize..."
                            sleep 20
                            
                            # Start Patient Service
                            echo "Starting Patient Service..."
                            docker run -d \\
                                --name mhrs-patient-service \\
                                --network mhrs-network \\
                                -e SPRING_DATASOURCE_URL=jdbc:mysql://mhrs-mysql:3306/medical_health_record \\
                                -e SPRING_DATASOURCE_USERNAME=mhrs_user \\
                                -e SPRING_DATASOURCE_PASSWORD=mhrs_password \\
                                -e SERVER_PORT=8083 \\
                                -p 8082:8083 \\
                                ${SERVICE_NAME}:${IMAGE_TAG}
                                
                            echo "Waiting for service to start..."
                            sleep 15
                        '''
                    } else if (params.ENVIRONMENT == 'STAGING') {
                        echo "Deploying to staging environment"
                    } else if (params.ENVIRONMENT == 'PROD') {
                        echo "Deploying to production environment"
                    }
                }
            }
        }

        stage('9. Health Check') {
            steps {
                echo "======== Performing health checks ========"
                script {
                    sh '''
                        echo "Checking service health (Docker Exec)..."
                        i=1
                        while [ $i -le 30 ]; do
                            if docker exec mhrs-patient-service curl -f http://localhost:8083/api/v1/patients/health/check > /dev/null 2>&1; then
                                echo "✓ Service is healthy!"
                                exit 0
                            fi
                            echo "Attempt $i/30 - Service not ready yet, retrying..."
                            sleep 2
                            i=$((i+1))
                        done
                        echo "✗ Health check failed after 30 attempts"
                        echo "Container logs:"
                        docker logs mhrs-patient-service
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
