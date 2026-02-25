---
name: "terraform-module"
studio: "devops-studio"
tier: "tier-1"
---

# Terraform module template
## Terraform Module Template
```hcl
# variables.tf
variable "project_name" { type = string }
variable "environment" { type = string }
variable "region" { type = string, default = "us-east-1" }

# main.tf
terraform { required_version = ">= 1.0" }

resource "aws_resource" "main" {
  name = "${var.project_name}-${var.environment}"
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# outputs.tf
output "resource_id" { value = aws_resource.main.id }
output "resource_arn" { value = aws_resource.main.arn }
```
