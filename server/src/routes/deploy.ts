import { Router } from 'express';
import * as s3 from '../services/s3';
import * as cloudfront from '../services/cloudfront';
import { authMiddleware } from '../middleware/auth';

export const deployRouter = Router();
deployRouter.use(authMiddleware);

deployRouter.post('/publish', async (_req, res) => {
  try {
    const files = ['cards.json', 'synergies.json', 'config.json', 'theme.json'];
    for (const file of files) {
      try {
        const data = await s3.getJson(`drafts/${file}`);
        await s3.putJson(`live/${file}`, data);
      } catch { /* skip missing drafts */ }
    }

    let invalidationId = '';
    try {
      invalidationId = await cloudfront.invalidateCache(['/live/*']);
    } catch (err: any) {
      console.warn('CloudFront invalidation failed (may not be configured):', err.message);
    }

    res.json({ success: true, data: { invalidationId, publishedAt: new Date().toISOString() } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

deployRouter.get('/status', async (req, res) => {
  try {
    const { invalidationId } = req.query;
    if (!invalidationId || typeof invalidationId !== 'string') {
      return res.status(400).json({ success: false, error: 'invalidationId required' });
    }
    const status = await cloudfront.getInvalidationStatus(invalidationId);
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
