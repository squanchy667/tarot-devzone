#!/bin/bash
set -euo pipefail

ENV="${1:-prod}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Deploying Tarot DevZone (env: $ENV) ==="

echo "--- Building shared ---"
cd "$ROOT_DIR/shared" && npm run build

echo "--- Building server ---"
cd "$ROOT_DIR/server" && npm run build

echo "--- Deploying backend (SAM) ---"
cd "$ROOT_DIR/aws"
sam build --template template.yaml
sam deploy \
  --stack-name "tarot-devzone-$ENV" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides "Environment=$ENV" \
  --no-confirm-changeset

API_URL=$(aws cloudformation describe-stacks \
  --stack-name "tarot-devzone-$ENV" \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "tarot-devzone-$ENV" \
  --query 'Stacks[0].Outputs[?OutputKey==`DevZoneFrontendBucket`].OutputValue' \
  --output text)
FRONTEND_URL=$(aws cloudformation describe-stacks \
  --stack-name "tarot-devzone-$ENV" \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
  --output text)

echo "--- Building client (with API URL: ${API_URL}/api) ---"
cd "$ROOT_DIR/client"
VITE_API_URL="${API_URL}/api" npm run build

echo "--- Deploying frontend to S3 ---"
aws s3 sync "$ROOT_DIR/client/dist" "s3://$FRONTEND_BUCKET" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"
aws s3 cp "$ROOT_DIR/client/dist/index.html" "s3://$FRONTEND_BUCKET/index.html" \
  --cache-control "public, max-age=0, must-revalidate"

echo ""
echo "=== Deployment Complete ==="
echo "API:      $API_URL"
echo "Frontend: $FRONTEND_URL"
echo "Bucket:   $FRONTEND_BUCKET"
