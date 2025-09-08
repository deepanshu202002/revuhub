pipeline {
  agent any

  environment {
    AWS_REGION = 'ap-south-1'
    ECR_REPO = '842676016170.dkr.ecr.ap-south-1.amazonaws.com/revuhub-backend'
    S3_BUCKET = 'revuhub-frontend'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Terraform Init & Apply') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ID', passwordVariable: 'AWS_SECRET')]) {
          sh '''
            export AWS_ACCESS_KEY_ID=$AWS_ID
            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET

            cd infra/terraform
            terraform init -input=false
            terraform apply -auto-approve

            # Capture backend EC2 IP and CloudFront distribution ID
            BACKEND_IP=$(terraform output -raw backend_public_ip)
            CLOUDFRONT_DIST_ID=$(terraform output -raw cloudfront_dist_id)

            # Write them to a file for frontend build
            echo "REACT_APP_BACKEND_URL=http://$BACKEND_IP:4000/api" > ../frontend/deploy.env
            echo "CLOUDFRONT_DIST_ID=$CLOUDFRONT_DIST_ID" >> ../frontend/deploy.env

            # Dynamically create Ansible inventory
            echo "[backend]" > ../ansible/inventory
            echo "$BACKEND_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/revuhub.pem" >> ../ansible/inventory
          '''
        }
      }
    }

    stage('Build Backend Docker') {
      steps {
        sh """
          docker build -t ${ECR_REPO}:${IMAGE_TAG} ./backend
        """
      }
    }

    stage('Login & Push to ECR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ID', passwordVariable: 'AWS_SECRET')]) {
          sh '''
            export AWS_ACCESS_KEY_ID=$AWS_ID
            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET

            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO.split('/')[0]}
            docker push ${ECR_REPO}:${IMAGE_TAG}
          '''
        }
      }
    }

    stage('Deploy Backend via Ansible') {
      steps {
        withCredentials([
          string(credentialsId: 'revuhub-prod-env', variable: 'PROD_ENV'),
          file(credentialsId: 'revuhub-ssh-key', variable: 'SSH_KEY')
        ]) {
          sh '''
            # Write backend secrets to temp file
            echo "$PROD_ENV" > /tmp/production.env
            chmod 600 /tmp/production.env

            # Convert to JSON for Ansible
            python3 -c "import json; print(json.dumps({'production_env_content': open('/tmp/production.env').read()}))" > /tmp/prod_env.json

            # Update inventory to use SSH key from Jenkins
            BACKEND_IP=$(terraform output -raw backend_public_ip)
            echo "[backend]" > infra/ansible/inventory
            echo "$BACKEND_IP ansible_user=ubuntu ansible_ssh_private_key_file=$SSH_KEY" >> infra/ansible/inventory

            # Run Ansible to deploy Docker container on EC2
            ansible-playbook -i infra/ansible/inventory infra/ansible/playbook.yml --extra-vars "@/tmp/prod_env.json"
          '''
        }
      }
    }

    stage('Build Frontend & Deploy to S3') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ID', passwordVariable: 'AWS_SECRET')]) {
          sh '''
            export AWS_ACCESS_KEY_ID=$AWS_ID
            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET

            cd frontend

            # Load backend URL and CloudFront ID
            export $(cat deploy.env | xargs)

            npm ci
            npm run build

            # Deploy frontend to S3
            aws s3 sync build/ s3://${S3_BUCKET} --delete

            # Invalidate CloudFront cache
            aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DIST_ID} --paths "/*"
          '''
        }
      }
    }
  }

  post {
    success { echo "Pipeline completed successfully" }
    failure { echo "Pipeline failed" }
  }
}
