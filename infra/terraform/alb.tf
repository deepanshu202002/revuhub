resource "aws_lb" "revuhub_alb" {
  name               = "revuhub-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public.id]

  tags = { Name = "revuhub-alb" }
}

resource "aws_lb_target_group" "revuhub_tg" {
  name     = "revuhub-tg"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = aws_vpc.revuhub_vpc.id   

  health_check {
    path                = "/api"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }
}

resource "aws_lb_listener" "revuhub_listener" {
  load_balancer_arn = aws_lb.revuhub_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.revuhub_tg.arn
  }
}

resource "aws_lb_target_group_attachment" "revuhub_attach" {
  target_group_arn = aws_lb_target_group.revuhub_tg.arn
  target_id        = aws_instance.revuhub.id
  port             = 4000
}

output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = aws_lb.revuhub_alb.dns_name
}
