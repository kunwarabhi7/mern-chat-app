pipeline {
    agent any

    stages {
        stage("Setup Environment") {
            steps {
                withCredentials([
                    file(
                        credentialsId: "client-env",
                        variable: "CLIENT_ENV"
                    ),
                    file(
                        credentialsId: "server-env",
                        variable: "SERVER_ENV"
                    )
                ]) {
                    sh '''
                        cp "$CLIENT_ENV" client/.env
                        cp "$SERVER_ENV" server/.env
                    '''
                }
            }
        }

        stage("Docker Compose Build") {
            steps {
                sh "docker compose build"
            }
        }

        stage("Docker Compose Deploy") {
            steps {
                sh "docker compose up -d"
            }
        }

        stage("Verify") {
            steps {
                sh "docker compose ps"
            }
        }
    }
}
