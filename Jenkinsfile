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
            steps {
                echo "======== Running unit tests ========"
                dir('patient-service') {
                    sh 'mvn test'
                }
            }
        }

        stage('4. Code Quality Analysis') {
            steps {
                echo "======== Performing code quality checks ========"
                dir('patient-service') {
                    // Optional: Integrate SonarQube for static code analysis
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
                    sh 'docker build -t ${DOCKER_IMAGE} .'
                    sh 'docker tag ${DOCKER_IMAGE} ${DOCKER_HUB_REPO}/${SERVICE_NAME}:latest'
                }
            }
        }

        stage('7. Push to Docker Hub') {
            when {
                branch 'main'
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
                            docker-compose -f docker-compose.yml down
                            docker-compose -f docker-compose.yml up -d
                            sleep 10
                            curl -f http://localhost:8082/patient-service/api/v1/patients/health/check || exit 1
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
                sh '''
                    for i in {1..30}; do
                        if curl -f http://localhost:8082/patient-service/api/v1/patients/health/check; then
                            echo "Service is healthy"
                            exit 0
                        fi
                        echo "Attempt $i failed, retrying..."
                        sleep 2
                    done
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            echo "======== Pipeline completed ========"
            // Archive artifacts
            archiveArtifacts artifacts: 'patient-service/target/*.jar', allowEmptyArchive: true
            
            // Clean up
            cleanWs()
        }

        success {
            echo "======== Pipeline SUCCESS ========"
            // Send success notification
        }

        failure {
            echo "======== Pipeline FAILED ========"
            // Send failure notification
        }
    }
}
