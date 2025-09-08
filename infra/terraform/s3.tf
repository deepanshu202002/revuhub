resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "revuhub-frontend"
  force_destroy = true

  tags = {
    Name = "revuhub-frontend"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_block" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
