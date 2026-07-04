#!/bin/bash
# T700: Deploy the DevZone backend to the active AWS account (502140064073, eu-west-1).
# Context: the original Feb-2026 deployment lived in the closed venture account and is gone
# (CloudFront dead, S3 NoSuchBucket). This recreates it. Cost: ~$1-2/mo serverless.
# Run manually after review:   ./deploy-prod.sh
# (sam build artifacts are already prepared in .aws-sam/ — safe to re-run sam build anytime)
set -euo pipefail
cd "$(dirname "$0")"

REGION=eu-west-1
STACK=tarot-devzone-prod

# Strong JWT secret: generated once, kept out of git. Reuse if present so redeploys don't
# invalidate existing player tokens.
SECRET_FILE=".jwt-secret-prod"   # gitignored via .env pattern? verify: echo it into .gitignore if missing
if [ ! -f "$SECRET_FILE" ]; then
  openssl rand -base64 48 | tr -d '/+=' | head -c 48 > "$SECRET_FILE"
  chmod 600 "$SECRET_FILE"
  grep -qx "$SECRET_FILE" .gitignore || echo "$SECRET_FILE" >> .gitignore
fi
JWT=$(cat "$SECRET_FILE")

sam build --template aws/template.yaml
sam deploy \
  --template aws/template.yaml \
  --stack-name "$STACK" \
  --region "$REGION" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset --no-fail-on-empty-changeset \
  --parameter-overrides Environment=prod JwtSecret="$JWT"

echo "=== Stack outputs ==="
aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
  --query 'Stacks[0].Outputs' --output table

echo "=== Seeding game data (live/) ==="
for f in cards synergies config theme; do
  aws s3 cp "data/$f.json" "s3://tarot-battlegrounds-data-prod/live/$f.json" --region "$REGION"
done

echo "=== Smoke test ==="
API=$(aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)
echo "API: $API"
curl -s -X POST "$API/api/game-auth/guest" -H 'Content-Type: application/json' -d '{}' | head -c 300; echo
curl -s "https://tarot-battlegrounds-data-prod.s3.$REGION.amazonaws.com/live/cards.json" | head -c 120; echo
echo "DONE — give the ApiUrl + data URL to Claude to wire DataConfig (T700 client half)."
