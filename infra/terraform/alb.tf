# Application Load Balancer
resource "aws_lb" "revuhub_alb" {
  name               = "revuhub-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  enable_deletion_protection = false

  tags = { Name = "revuhub-alb" }
}

# Target Group for Backend EC2s
resource "aws_lb_target_group" "revuhub_tg" {
  name     = "revuhub-tg"
  port     = 4000 # backend app port
  protocol = "HTTP"
  vpc_id   = aws_vpc.revuhub_vpc.id

  health_check {
    path                = "/api/health"   # change to your backend health endpoint
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }
}

# Listener for ALB (HTTP on port 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.revuhub_alb.arn
  port              = 80
  protocol          = "HTTP"

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
