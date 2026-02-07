#!/bin/bash
set -euo pipefail

ENV="${1:-prod}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Setting up Tarot DevZone Infrastructure (env: $ENV) ==="

command -v aws >/dev/null 2>&1 || { echo "AWS CLI required"; exit 1; }
command -v sam >/dev/null 2>&1 || { echo "SAM CLI required"; exit 1; }

read -sp "Enter JWT secret (enter for auto-generated): " JWT_SECRET
echo ""
if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  echo "Generated JWT secret: $JWT_SECRET"
fi

read -p "Enter game CloudFront distribution ID (enter to skip): " GAME_DIST_ID
GAME_DIST_ID="${GAME_DIST_ID:-none}"

cd "$SCRIPT_DIR"
sam build --template template.yaml
sam deploy \
  --stack-name "tarot-devzone-$ENV" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    "Environment=$ENV" \
    "JwtSecret=$JWT_SECRET" \
    "GameDistributionId=$GAME_DIST_ID" \
  --no-confirm-changeset

echo ""
echo "=== Infrastructure Created ==="
echo "Next: seed DB, export data, upload to S3"
