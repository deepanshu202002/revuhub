resource "aws_ecr_repository" "backend_repo" {
  name = "revuhub-backend"
}

output "backend_ecr_url" {
  value = aws_ecr_repository.backend_repo.repository_url
}
