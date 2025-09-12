# Security Group for the Application Load Balancer (ALB)
resource "aws_security_group" "alb_sg" {
  name        = "revuhub-alb-sg"
  description = "Allow HTTP and HTTPS traffic"
  vpc_id      = aws_vpc.revuhub_vpc.id

  # Allow HTTP inbound traffic
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTPS inbound traffic
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow outbound traffic to anywhere
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "revuhub-alb-sg" }
}

# Application Load Balancer
resource "aws_lb" "revuhub_alb" {
  name               = "revuhub-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id] # Referencing the ALB's SG
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  enable_deletion_protection = false

  tags = { Name = "revuhub-alb" }
}

# Target Group for Backend EC2s
resource "aws_lb_target_group" "revuhub_tg" {
  name        = "revuhub-tg"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.revuhub_vpc.id
}

# Listener for ALB (HTTPS on port 443)
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.revuhub_alb.arn
  port              = 443
  protocol          = "HTTPS"
  certificate_arn   = var.alb_certificate_arn # You must provide this ARN

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.revuhub_tg.arn
  }
}

# Attach EC2 instance(s) to Target Group
resource "aws_lb_target_group_attachment" "revuhub_attach" {
  target_group_arn = aws_lb_target_group.revuhub_tg.arn
  target_id        = aws_instance.revuhub.id
  port             = 4000
}