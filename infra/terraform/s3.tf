resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "revuhub-frontend"
  acl    = "public-read"
}
