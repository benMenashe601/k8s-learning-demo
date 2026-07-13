pipeline {
    agent { label 'node' }

    stages {
        stage('CI') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }
    }
}
