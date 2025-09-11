resource "aws_security_group" "alb_sg" {
  name        = "revuhub-alb-sg"
  description = "Allow HTTP access to ALB"
  vpc_id      = aws_vpc.main.id   # change if your VPC name differs

  ingress {
    description = "Allow HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "revuhub-alb-sg"
  }
}
