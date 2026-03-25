#!/usr/bin/env bash
set -euo pipefail

# Deploy to AWS S3 + CloudFront
# Usage: bash scripts/deploy.sh <S3_BUCKET> <CLOUDFRONT_DISTRIBUTION_ID>
#
# Example:
#   bash scripts/deploy.sh my-site-bucket E1A2B3C4D5E6F7

BUCKET="${1:?Usage: deploy.sh <S3_BUCKET> <CF_DISTRIBUTION_ID>}"
CF_DIST="${2:?Usage: deploy.sh <S3_BUCKET> <CF_DISTRIBUTION_ID>}"
DIST_DIR="dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "Error: $DIST_DIR directory not found. Run 'npm run build' first."
  exit 1
fi

echo "==> Deploying to s3://$BUCKET"

# Sync HTML files — short cache, must-revalidate
aws s3 sync "$DIST_DIR" "s3://$BUCKET" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=300, must-revalidate" \
  --content-type "text/html; charset=utf-8"

# Sync hashed assets — long cache (1 year)
aws s3 sync "$DIST_DIR/assets" "s3://$BUCKET/assets" \
  --cache-control "public, max-age=31536000, immutable"

# Sync fonts — long cache
aws s3 sync "$DIST_DIR/fonts" "s3://$BUCKET/fonts" \
  --cache-control "public, max-age=31536000, immutable"

# Sync images — medium cache (1 week)
aws s3 sync "$DIST_DIR/images" "s3://$BUCKET/images" \
  --cache-control "public, max-age=604800"

# Sync remaining files (robots.txt, site.webmanifest, etc.)
aws s3 sync "$DIST_DIR" "s3://$BUCKET" \
  --exclude "*.html" \
  --exclude "assets/*" \
  --exclude "fonts/*" \
  --exclude "images/*" \
  --cache-control "public, max-age=3600"

echo "==> Invalidating CloudFront distribution $CF_DIST"
aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text

echo "==> Deploy complete!"
