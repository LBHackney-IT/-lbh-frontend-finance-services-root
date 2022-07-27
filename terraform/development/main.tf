provider "aws" {
  region  = "eu-west-2"
  version = "~> 2.0"
}
terraform {
  backend "s3" {
    bucket  = "terraform-state-housing-development"
    encrypt = true
    region  = "eu-west-2"
    key     = "services/finance-root-frontend/state"
  }
}
resource "aws_s3_bucket" "frontend-bucket-development" {
  bucket = "lbh-housing-finance-root-frontend-development.hackney.gov.uk"
  acl    = "private"
  versioning {
    enabled = true
  }
  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}
module "cloudfront-development" {
  source = "github.com/LBHackney-IT/aws-hackney-common-terraform.git//modules/cloudfront/s3_distribution"
  s3_domain_name = aws_s3_bucket.frontend-bucket-development.bucket_regional_domain_name
  origin_id = "mtfh-finance-root-frontend"
  s3_bucket_arn = aws_s3_bucket.frontend-bucket-development.arn
  s3_bucket_id = aws_s3_bucket.frontend-bucket-development.id
  orginin_access_identity_desc = "Finance root frontend cloudfront identity"
  cname_aliases = ["hfs-development.hackney.gov.uk"]
  environment_name = "development"
  cost_code = "B0811"
  project_name = "MTFH Finance"
  use_cloudfront_cert = false
  hackney_cert_arn = "arn:aws:acm:us-east-1:364864573329:certificate/0b6b5820-fbd0-4b45-b8e2-cc5846adf8d9"
  compress = true
}
