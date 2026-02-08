# Custom Domain Setup

This guide walks through deploying the DevZone and game data behind a custom domain using CloudFront and Route53.

## Prerequisites

1. **A registered domain** (e.g., `yourgame.com`)
2. **AWS CLI** configured with appropriate permissions
3. **SAM CLI** installed

## Step 1: Create Route53 Hosted Zone

If you don't already have one:

```bash
aws route53 create-hosted-zone --name yourgame.com --caller-reference $(date +%s)
```

Note the `HostedZoneId` from the output. Update your domain registrar's nameservers to the NS records from Route53.

## Step 2: Request ACM Certificate

The certificate **must** be in `us-east-1` (required by CloudFront):

```bash
aws acm request-certificate \
  --domain-name "*.yourgame.com" \
  --validation-method DNS \
  --region us-east-1
```

Note the `CertificateArn` from the output. Complete DNS validation by adding the CNAME record shown:

```bash
aws acm describe-certificate --certificate-arn <ARN> --region us-east-1
```

Add the CNAME to Route53 and wait for validation (usually 5-10 minutes).

## Step 3: Deploy Stack with Domain Parameters

```bash
cd aws
sam deploy \
  --parameter-overrides \
    Environment=prod \
    JwtSecret=<your-secret> \
    GameDistributionId=<existing-cf-id> \
    DomainName=yourgame.com \
    HostedZoneId=<your-zone-id> \
    CertificateArn=<your-cert-arn>
```

This creates:
- `devzone.yourgame.com` — DevZone React editor
- `data.yourgame.com` — Game data CDN (JSON + images)

## Step 4: Update Client Environment

Set the game URL in your client build:

```bash
VITE_GAME_URL=https://data.yourgame.com
```

## Step 5: Update Unity DataConfig

In the Unity project, update the `DataConfig` ScriptableObject:

```
dataBaseUrl = "https://data.yourgame.com/live/"
```

## What Gets Created

| Resource | Subdomain | Purpose |
|----------|-----------|---------|
| DevZoneDistribution | `devzone.yourgame.com` | Serves React frontend with SPA routing (404/403 → index.html) |
| GameDataDistribution | `data.yourgame.com` | Serves game data with CORS for Unity WebGL |
| DevZoneDnsRecord | A record alias | Points devzone subdomain to CloudFront |
| GameDataDnsRecord | A record alias | Points data subdomain to CloudFront |

## Without Custom Domain

If you deploy without the `DomainName` parameter (or leave it empty), none of the custom domain resources are created. The stack works exactly as before with S3 website hosting and existing CloudFront distributions.

## CORS

The S3 bucket CORS configuration automatically includes custom domain origins when `DomainName` is set:
- `https://data.yourgame.com`
- `https://devzone.yourgame.com`
- `https://dui22oafwco41.cloudfront.net` (existing)
- `http://localhost:5173` (local dev)
