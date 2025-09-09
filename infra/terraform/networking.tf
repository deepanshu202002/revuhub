# =====================
# Networking: VPC, Subnet, IGW, Route Table
# =====================
data "aws_availability_zones" "available" {}

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
