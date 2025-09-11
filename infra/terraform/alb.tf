# Application Load Balancer
resource "aws_lb" "revuhub_alb" {
  name               = "revuhub-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id   # update if your subnet resource name differs

  enable_deletion_protection = false

  tags = {
    Name = "revuhub-alb"
  }
}

# Target Group
resource "aws_lb_target_group" "revuhub_tg" {
  name     = "revuhub-tg"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/api"   # adjust if your backend health endpoint is different
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "revuhub-target-group"
  }
}

# Listener (HTTP port 80)
resource "aws_lb_listener" "revuhub_listener" {
  load_balancer_arn = aws_lb.revuhub_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.revuhub_tg.arn
  }
}

# Attach EC2 instances to Target Group
resource "aws_lb_target_group_attachment" "revuhub_ec2_attach" {
  count            = length(aws_instance.revuhub)   # replace with your EC2 resource
  target_group_arn = aws_lb_target_group.revuhub_tg.arn
  target_id        = aws_instance.revuhub[count.index].id
  port             = 4000
}
