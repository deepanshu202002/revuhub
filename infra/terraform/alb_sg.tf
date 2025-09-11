resource "aws_security_group" "alb_sg" {
  name        = "revuhub-alb-sg"
  description = "Allow HTTP traffic to ALB"
  vpc_id      = aws_vpc.revuhub_vpc.id   

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "revuhub-alb-sg" }
}
