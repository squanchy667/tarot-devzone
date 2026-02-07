import { Router } from 'express';
import type { SynergyData } from '@tarot-devzone/shared';
import { synergySchema } from '@tarot-devzone/shared';
import * as s3 from '../services/s3';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validation';

export const synergiesRouter = Router();
synergiesRouter.use(authMiddleware);

synergiesRouter.get('/', async (req, res) => {
  try {
    const source = req.query.source === 'live' ? 'live' : 'drafts';
    let synergies: SynergyData[];
    try {
      synergies = await s3.getJson<SynergyData[]>(`${source}/synergies.json`);
    } catch {
      synergies = await s3.getJson<SynergyData[]>('live/synergies.json');
    }
    res.json({ success: true, data: synergies });
  } catch {
    res.json({ success: true, data: [] });
  }
});

synergiesRouter.put('/:tribe', validate(synergySchema), async (req, res) => {
  try {
    let synergies: SynergyData[];
    try { synergies = await s3.getJson<SynergyData[]>('drafts/synergies.json'); } catch { synergies = []; }
    const idx = synergies.findIndex(s => s.tribeType === req.params.tribe);
    if (idx === -1) {
      synergies.push(req.body);
    } else {
      synergies[idx] = req.body;
    }
    await s3.putJson('drafts/synergies.json', synergies);
    res.json({ success: true, data: req.body });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
