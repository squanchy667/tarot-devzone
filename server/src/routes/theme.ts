import { Router } from 'express';
import type { ThemeData } from '@tarot-devzone/shared';
import { themeSchema } from '@tarot-devzone/shared';
import * as s3 from '../services/s3';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validation';

export const themeRouter = Router();
themeRouter.use(authMiddleware);

themeRouter.get('/', async (req, res) => {
  try {
    const source = req.query.source === 'live' ? 'live' : 'drafts';
    let theme: ThemeData;
    try {
      theme = await s3.getJson<ThemeData>(`${source}/theme.json`);
    } catch {
      theme = await s3.getJson<ThemeData>('live/theme.json');
    }
    res.json({ success: true, data: theme });
  } catch {
    res.json({ success: true, data: null });
  }
});

themeRouter.put('/', validate(themeSchema), async (req, res) => {
  try {
    await s3.putJson('drafts/theme.json', req.body);
    res.json({ success: true, data: req.body });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
