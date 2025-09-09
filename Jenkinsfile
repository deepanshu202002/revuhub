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
            BACKEND_IP=$(terraform output revuhub_instance_public_ip | tr -d '"')
            CLOUDFRONT_DIST_ID=$(terraform output frontend_distribution_id | tr -d '"')

            # Ensure directories exist before writing files
            mkdir -p ../../frontend
            mkdir -p ../../ansible

            # Write them to a file for frontend build
            echo "REACT_APP_BACKEND_URL=http://$BACKEND_IP:4000/api" > ../../frontend/deploy.env
            echo "CLOUDFRONT_DIST_ID=$CLOUDFRONT_DIST_ID" >> ../../frontend/deploy.env
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

            ECR_ACCOUNT_ID=$(echo ${ECR_REPO} | cut -d'/' -f1)

            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin $ECR_ACCOUNT_ID
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

        # Create Ansible inventory dynamically
        mkdir -p infra/ansible
        BACKEND_IP=$(terraform output -raw revuhub_instance_public_ip)
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
        withCredentials([
            string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
            sh '''
              # Export AWS credentials
              export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
              export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
              export AWS_DEFAULT_REGION=ap-south-1

              cd frontend

              # Load environment variables if deploy.env exists
              [ ! -f deploy.env ] || export $(cat deploy.env | xargs)

              # Install dependencies & build frontend
              npm ci
              npm run build

              # Sync build output (Vite -> dist/) to S3
              aws s3 sync dist/ s3://revuhub-frontend --delete
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
