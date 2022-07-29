provider "aws" {
  region  = "eu-west-2"
  version = "~> 2.0"
}
terraform {
  backend "s3" {
    bucket  = "terraform-state-housing-development"
    encrypt = true
    region  = "eu-west-2"
    key     = "services/finance-services-fe-root/state"
  }
}
resource "aws_s3_bucket" "frontend-bucket-development" {
  bucket = "lbh-housing-finance-services-fe-root-development.hackney.gov.uk"
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
  origin_id = "mtfh-finance-services-fe-root"
  s3_bucket_arn = aws_s3_bucket.frontend-bucket-development.arn
  s3_bucket_id = aws_s3_bucket.frontend-bucket-development.id
  orginin_access_identity_desc = "Finance services root frontend cloudfront identity"
  cname_aliases = ["finance-services-development1.hackney.gov.uk"]
  environment_name = "development"
  cost_code = "B0811"
  project_name = "MTFH Finance"
  use_cloudfront_cert = false
  hackney_cert_arn = "arn:aws:acm:us-east-1:364864573329:certificate/d9af3725-41db-429b-8e13-a3174d6e5698"
  compress = true
}
