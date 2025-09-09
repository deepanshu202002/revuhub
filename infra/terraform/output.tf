# EC2
output "revuhub_instance_public_ip" {
  value = aws_instance.revuhub.public_ip
}

output "revuhub_instance_public_dns" {
  value = aws_instance.revuhub.public_dns
}

# Networking
output "revuhub_vpc_id" {
  value = aws_vpc.revuhub_vpc.id
}

output "revuhub_subnet_id" {
  value = aws_subnet.public.id
}

# Security Group
output "revuhub_security_group" {
  value = aws_security_group.backend_sg.id
}

# ECR
output "backend_ecr_url" {
  value = aws_ecr_repository.backend_repo.repository_url
}

# S3
output "frontend_s3_bucket" {
  value = aws_s3_bucket.frontend_bucket.bucket
}

# CloudFront
output "frontend_distribution_id" {
  value = aws_cloudfront_distribution.frontend_distribution.id
}

output "frontend_distribution_domain_name" {
  value = aws_cloudfront_distribution.frontend_distribution.domain_name
}
