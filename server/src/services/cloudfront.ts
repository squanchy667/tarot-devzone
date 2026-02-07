import { CloudFrontClient, CreateInvalidationCommand, GetInvalidationCommand } from '@aws-sdk/client-cloudfront';

const cf = new CloudFrontClient({ region: process.env.AWS_REGION || 'us-east-1' });

export async function invalidateCache(paths: string[] = ['/live/*']): Promise<string> {
  const distributionId = process.env.CLOUDFRONT_DATA_DISTRIBUTION_ID;
  if (!distributionId) throw new Error('CLOUDFRONT_DATA_DISTRIBUTION_ID not set');

  const res = await cf.send(new CreateInvalidationCommand({
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `devzone-${Date.now()}`,
      Paths: { Quantity: paths.length, Items: paths },
    },
  }));
  return res.Invalidation!.Id!;
}

export async function getInvalidationStatus(invalidationId: string): Promise<{ status: string; createTime: Date }> {
  const distributionId = process.env.CLOUDFRONT_DATA_DISTRIBUTION_ID;
  if (!distributionId) throw new Error('CLOUDFRONT_DATA_DISTRIBUTION_ID not set');

  const res = await cf.send(new GetInvalidationCommand({
    DistributionId: distributionId,
    Id: invalidationId,
  }));
  return {
    status: res.Invalidation!.Status!,
    createTime: res.Invalidation!.CreateTime!,
  };
}
