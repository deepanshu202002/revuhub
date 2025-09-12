pipeline {
  agent any

  environment {
    AWS_REGION = 'ap-south-1'
    ECR_REPO   = '842676016170.dkr.ecr.ap-south-1.amazonaws.com/revuhub-backend'
    S3_BUCKET  = 'revuhub-frontend'
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Terraform Init & Apply') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds']]) {
          sh '''
            export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
            export AWS_DEFAULT_REGION=$AWS_REGION

            # Get Jenkins node public IP
            MY_IP=$(curl -s https://checkip.amazonaws.com)/32
            echo "Using Jenkins public IP: $MY_IP"

            cd infra/terraform
            terraform init -input=false
            terraform import -no-color aws_security_group.alb_sg sg-035dc75746aa00f1a || true
            terraform import -no-color aws_security_group.backend_sg sg-03fd1636f5e9bdf75 || true

            terraform plan -var="my_ip=$MY_IP" -out=tfplan
            terraform apply -auto-approve tfplan

            # Capture ALB DNS and CloudFront domain
            ALB_URL=$(terraform output -raw alb_dns_name || true)
            CLOUDFRONT_URL=$(terraform output -raw frontend_distribution_domain_name || true)

            echo "ALB_URL=$ALB_URL"
            echo "CLOUDFRONT_URL=$CLOUDFRONT_URL"

            # Ensure frontend folder exists
            mkdir -p ../../frontend

            # Overwrite deploy.env with HTTPS CloudFront URL
            rm -f ../../frontend/deploy.env
            echo "VITE_REACT_APP_BACKEND_URL=https://$CLOUDFRONT_URL" > ../../frontend/deploy.env
            echo "VITE_GOOGLE_CLIENT_ID=591507211815-evk7chd40soo41lilg8pp3qc64pev5l6.apps.googleusercontent.com" >> ../../frontend/deploy.env

            echo "Generated frontend deploy.env:"
            cat ../../frontend/deploy.env
          '''
        }
      }
    }

    stage('Build Backend Docker') {
      steps {
        sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ./backend"
      }
    }

    stage('Login & Push to ECR') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds']]) {
          sh '''
            aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ECR_REPO%/*}
            docker push $ECR_REPO:$BUILD_NUMBER
          '''
        }
      }
    }

    stage('Deploy Backend via Ansible') {
      steps {
        withCredentials([
          file(credentialsId: 'revuhub-prod-env', variable: 'PROD_ENV'),
          sshUserPrivateKey(credentialsId: 'revuhub-ssh-key', keyFileVariable: 'SSH_KEY')
        ]) {
          sh '''
            chmod 600 $PROD_ENV
            chmod 600 $SSH_KEY

            mkdir -p infra/ansible
            python3 -c "import json; print(json.dumps({'production_env_content': open('$PROD_ENV').read()}))" > /tmp/prod_env.json

            BACKEND_IP=$(cd infra/terraform && terraform output -raw revuhub_instance_public_ip 2>/dev/null || true)

            if [ -n "$BACKEND_IP" ]; then
              echo "[backend]" > infra/ansible/inventory
              echo "$BACKEND_IP ansible_user=ubuntu ansible_ssh_private_key_file=$SSH_KEY" >> infra/ansible/inventory
              mkdir -p ~/.ssh
              ssh-keyscan -H $BACKEND_IP >> ~/.ssh/known_hosts
            else
              echo "ERROR: No backend IP found from Terraform outputs!"
              exit 1
            fi

            export ANSIBLE_HOST_KEY_CHECKING=False
            ansible-playbook -i infra/ansible/inventory infra/ansible/playbook.yml --extra-vars "docker_image_tag=${IMAGE_TAG}" --extra-vars @/tmp/prod_env.json
          '''
        }
      }
    }

    stage('Build Frontend & Deploy to S3') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds']]) {
          sh '''
            export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
            export AWS_DEFAULT_REGION=$AWS_REGION

            cd frontend
            [ -f deploy.env ] && export $(cat deploy.env | xargs)

            npm ci
            npm run build

            aws s3 sync dist/ s3://$S3_BUCKET --delete
          '''
        }
      }
    }
  }

  post {
    success { echo "✅ Pipeline completed successfully" }
    failure { echo "❌ Pipeline failed" }
  }
}
