provider "aws" {
  region  = "eu-west-2"
  version = "~> 2.0"
}
terraform {
  backend "s3" {
    bucket  = "terraform-state-housing-production"
    encrypt = true
    region  = "eu-west-2"
    key     = "services/finance-services-fe-root/state"
  }
}
resource "aws_s3_bucket" "frontend-bucket-production" {
  bucket = "lbh-housing-finance-services-fe-root-production.hackney.gov.uk"
  acl    = "private"
  versioning {
    enabled = true
  }
  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}
module "cloudfront-production" {
  source = "github.com/LBHackney-IT/aws-hackney-common-terraform.git//modules/cloudfront/s3_distribution"
  s3_domain_name = aws_s3_bucket.frontend-bucket-production.bucket_regional_domain_name
  origin_id = "mtfh-finance-root-frontend"
  s3_bucket_arn = aws_s3_bucket.frontend-bucket-production.arn
  s3_bucket_id = aws_s3_bucket.frontend-bucket-production.id
  orginin_access_identity_desc = "Finance services root frontend cloudfront identity"
  cname_aliases = ["finance-services.hackney.gov.uk"]
  environment_name = "production"
  cost_code = "B0811"
  project_name = "MTFH Finance"
  use_cloudfront_cert = false
  hackney_cert_arn = "arn:aws:acm:us-east-1:282997303675:certificate/ae75cd76-4552-4fdb-a4a1-14f1c78e9500"
  compress = true
}
