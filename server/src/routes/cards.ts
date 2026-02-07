import { Router } from 'express';
import type { CardData } from '@tarot-devzone/shared';
import { cardSchema } from '@tarot-devzone/shared';
import * as s3 from '../services/s3';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validation';

export const cardsRouter = Router();
cardsRouter.use(authMiddleware);

cardsRouter.get('/', async (req, res) => {
  try {
    const source = req.query.source === 'live' ? 'live' : 'drafts';
    let cards: CardData[];
    try {
      cards = await s3.getJson<CardData[]>(`${source}/cards.json`);
    } catch {
      cards = await s3.getJson<CardData[]>('live/cards.json');
    }
    res.json({ success: true, data: cards });
  } catch {
    res.json({ success: true, data: [] });
  }
});

cardsRouter.get('/:id', async (req, res) => {
  try {
    const cards = await s3.getJson<CardData[]>('drafts/cards.json');
    const card = cards.find(c => c.id === req.params.id);
    if (!card) return res.status(404).json({ success: false, error: 'Card not found' });
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

cardsRouter.post('/', validate(cardSchema), async (req, res) => {
  try {
    let cards: CardData[];
    try { cards = await s3.getJson<CardData[]>('drafts/cards.json'); } catch { cards = []; }
    if (cards.some(c => c.id === req.body.id)) {
      return res.status(409).json({ success: false, error: 'Card with this ID already exists' });
    }
    cards.push(req.body);
    await s3.putJson('drafts/cards.json', cards);
    res.json({ success: true, data: req.body });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

cardsRouter.put('/:id', validate(cardSchema), async (req, res) => {
  try {
    let cards: CardData[];
    try { cards = await s3.getJson<CardData[]>('drafts/cards.json'); } catch { cards = []; }
    const idx = cards.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Card not found' });
    cards[idx] = { ...req.body, id: req.params.id };
    await s3.putJson('drafts/cards.json', cards);
    res.json({ success: true, data: cards[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

cardsRouter.delete('/:id', async (req, res) => {
  try {
    let cards: CardData[];
    try { cards = await s3.getJson<CardData[]>('drafts/cards.json'); } catch { cards = []; }
    cards = cards.filter(c => c.id !== req.params.id);
    await s3.putJson('drafts/cards.json', cards);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
