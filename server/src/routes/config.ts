import { Router } from 'express';
import type { GameConfigData } from '@tarot-devzone/shared';
import { gameConfigSchema } from '@tarot-devzone/shared';
import * as s3 from '../services/s3';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validation';

export const configRouter = Router();
configRouter.use(authMiddleware);

configRouter.get('/', async (req, res) => {
  try {
    const source = req.query.source === 'live' ? 'live' : 'drafts';
    let config: GameConfigData;
    try {
      config = await s3.getJson<GameConfigData>(`${source}/config.json`);
    } catch {
      config = await s3.getJson<GameConfigData>('live/config.json');
    }
    res.json({ success: true, data: config });
  } catch {
    res.json({ success: true, data: null });
  }
});

configRouter.put('/', validate(gameConfigSchema), async (req, res) => {
  try {
    await s3.putJson('drafts/config.json', req.body);
    res.json({ success: true, data: req.body });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
