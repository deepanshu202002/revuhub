# =====================
# Region
# =====================
variable "region" {
  type    = string
  default = "ap-south-1"
}

provider "aws" {
  region = var.region
}

# =====================
# Lookup latest Ubuntu AMI
# =====================
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# =====================
# Networking
# =====================
resource "aws_vpc" "revuhub_vpc" {
  cidr_block = "10.0.0.0/16"
  tags       = { Name = "revuhub-vpc" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.revuhub_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[0]
  tags                    = { Name = "revuhub-public-subnet" }
}

data "aws_availability_zones" "available" {}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.revuhub_vpc.id
  tags   = { Name = "revuhub-igw" }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.revuhub_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_rt.id
}

# =====================
# Security Group
# =====================
resource "aws_security_group" "backend_sg" {
  name        = "revuhub-backend-sg"
  description = "Allow SSH, HTTP, HTTPS, and backend traffic"
  vpc_id      = aws_vpc.revuhub_vpc.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "revuhub-backend-sg" }
}

# =====================
# IAM Role for EC2
# =====================
resource "aws_iam_role" "ec2_role" {
  name               = "revuhub-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "s3_full" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "revuhub-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# =====================
# SSH Key
# =====================
resource "tls_private_key" "default_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "revuhub_keypair" {
  key_name   = "revuhub-key"
  public_key = tls_private_key.default_key.public_key_openssh
}

# =====================
# EC2 Instance
# =====================
resource "aws_instance" "revuhub" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t3.medium"
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  key_name                    = aws_key_pair.revuhub_keypair.key_name

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
              # install docker
              curl -fsSL https://get.docker.com | bash
              usermod -aG docker ubuntu || true
              # install docker-compose plugin
              mkdir -p /usr/local/bin
              curl -L "https://github.com/docker/compose/releases/download/v2.19.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              # enable docker service
              systemctl enable docker
              systemctl start docker
              EOF

  tags = { Name = "revuhub-backend-instance" }
}

# =====================
# Outputs
# =====================
output "revuhub_instance_public_ip" {
  value = aws_instance.revuhub.public_ip
}

output "revuhub_instance_public_dns" {
  value = aws_instance.revuhub.public_dns
}

output "revuhub_security_group" {
  value = aws_security_group.backend_sg.id
}

output "revuhub_private_key_pem" {
  value     = tls_private_key.default_key.private_key_pem
  sensitive = true
}
