import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from '../services/dynamodb';

export const gameAuthRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = 86400 * 7; // 7 days for game players

function generateId(): string {
  return 'p_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateGuestName(): string {
  const adjectives = ['Brave', 'Swift', 'Mystic', 'Shadow', 'Golden', 'Iron', 'Storm', 'Silent'];
  const nouns = ['Knight', 'Mage', 'Seer', 'Rogue', 'Dragon', 'Phoenix', 'Wolf', 'Hawk'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${adj}${noun}${num}`;
}

function signToken(player: { playerId: string; displayName: string; rating: number }) {
  return jwt.sign(
    { playerId: player.playerId, displayName: player.displayName, rating: player.rating },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/game-auth/register — Open registration (no admin required)
gameAuthRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ success: false, error: 'Email, password, and displayName required' });
    }
    if (displayName.length < 2 || displayName.length > 20) {
      return res.status(400).json({ success: false, error: 'Display name must be 2-20 characters' });
    }
    const existing = await db.getPlayerByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const player: db.GamePlayer = {
      playerId: generateId(),
      email,
      displayName,
      passwordHash,
      isGuest: false,
      rating: 1000,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      createdAt: new Date().toISOString(),
    };
    await db.createPlayer(player);
    const token = signToken(player);
    res.json({
      success: true,
      data: {
        token,
        player: { playerId: player.playerId, displayName: player.displayName, rating: player.rating },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/game-auth/login — Email + password auth
gameAuthRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    const player = await db.getPlayerByEmail(email);
    if (!player || !player.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, player.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = signToken(player);
    res.json({
      success: true,
      data: {
        token,
        player: { playerId: player.playerId, displayName: player.displayName, rating: player.rating },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/game-auth/guest — Anonymous player creation
gameAuthRouter.post('/guest', async (_req: Request, res: Response) => {
  try {
    const player: db.GamePlayer = {
      playerId: generateId(),
      displayName: generateGuestName(),
      isGuest: true,
      rating: 1000,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      createdAt: new Date().toISOString(),
    };
    await db.createPlayer(player);
    const token = signToken(player);
    res.json({
      success: true,
      data: {
        token,
        player: { playerId: player.playerId, displayName: player.displayName, rating: player.rating },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Middleware to validate game player JWT
export function gameAuthMiddleware(req: Request, res: Response, next: Function) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { playerId: string; displayName: string; rating: number };
    (req as any).player = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// GET /api/game-auth/profile — Fetch player profile
gameAuthRouter.get('/profile', gameAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { playerId } = (req as any).player;
    const player = await db.getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }
    const { passwordHash, ...profile } = player as any;
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/game-auth/profile — Update displayName
gameAuthRouter.put('/profile', gameAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { playerId } = (req as any).player;
    const { displayName } = req.body;
    if (!displayName || displayName.length < 2 || displayName.length > 20) {
      return res.status(400).json({ success: false, error: 'Display name must be 2-20 characters' });
    }
    await db.updatePlayerProfile(playerId, displayName);
    res.json({ success: true, data: { displayName } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
