import { Router, Request, Response } from 'express';
import * as db from '../services/dynamodb';
import { gameAuthMiddleware } from './game-auth';

export const matchmakingRouter = Router();

const MATCH_SIZE_MIN = 2;
const MATCH_SIZE_MAX = 4;
const BASE_RATING_RANGE = 200;
const RANGE_EXPANSION_PER_INTERVAL = 100;
const EXPANSION_INTERVAL_MS = 15000; // 15 seconds
const QUEUE_TTL_SECONDS = 300; // 5 minutes

function generateMatchId(): string {
  return 'm_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// POST /api/matchmaking/join — Add to queue
matchmakingRouter.post('/join', gameAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { playerId, displayName, rating } = (req as any).player;

    // Check if already in queue
    const existing = await db.getMatchmakingEntry(playerId);
    if (existing) {
      if (existing.status === 'matched') {
        return res.json({ success: true, data: { status: 'matched', matchId: existing.matchId } });
      }
      return res.json({ success: true, data: { status: 'waiting', message: 'Already in queue' } });
    }

    const entry: db.MatchmakingEntry = {
      playerId,
      displayName,
      rating,
      joinedAt: new Date().toISOString(),
      status: 'waiting',
      ttl: Math.floor(Date.now() / 1000) + QUEUE_TTL_SECONDS,
    };
    await db.joinMatchmaking(entry);

    // Try to find a match immediately
    const match = await tryMatchPlayers(playerId, rating);
    if (match) {
      return res.json({ success: true, data: { status: 'matched', matchId: match } });
    }

    res.json({ success: true, data: { status: 'waiting' } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/matchmaking/status — Check match status
matchmakingRouter.get('/status', gameAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { playerId, rating } = (req as any).player;
    const entry = await db.getMatchmakingEntry(playerId);

    if (!entry) {
      return res.json({ success: true, data: { status: 'not_in_queue' } });
    }

    if (entry.status === 'matched') {
      return res.json({ success: true, data: { status: 'matched', matchId: entry.matchId } });
    }

    // Try to match on each status poll
    const match = await tryMatchPlayers(playerId, rating);
    if (match) {
      return res.json({ success: true, data: { status: 'matched', matchId: match } });
    }

    const waitingMs = Date.now() - new Date(entry.joinedAt).getTime();
    const waitingPlayers = await db.getWaitingPlayers();

    res.json({
      success: true,
      data: {
        status: 'waiting',
        waitTimeSeconds: Math.floor(waitingMs / 1000),
        playersInQueue: waitingPlayers.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/matchmaking/cancel — Leave queue
matchmakingRouter.delete('/cancel', gameAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { playerId } = (req as any).player;
    await db.removeFromMatchmaking(playerId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function tryMatchPlayers(requestingPlayerId: string, requestingRating: number): Promise<string | null> {
  const waiting = await db.getWaitingPlayers();
  if (waiting.length < MATCH_SIZE_MIN) return null;

  // Find the requesting player's entry for wait time calculation
  const requesterEntry = waiting.find(w => w.playerId === requestingPlayerId);
  if (!requesterEntry) return null;

  const now = Date.now();
  const requesterWaitMs = now - new Date(requesterEntry.joinedAt).getTime();
  const expansions = Math.floor(requesterWaitMs / EXPANSION_INTERVAL_MS);
  const ratingRange = BASE_RATING_RANGE + expansions * RANGE_EXPANSION_PER_INTERVAL;

  // Find compatible players within rating range
  const compatible = waiting.filter(w => {
    if (w.playerId === requestingPlayerId) return true; // include self
    const otherWaitMs = now - new Date(w.joinedAt).getTime();
    const otherExpansions = Math.floor(otherWaitMs / EXPANSION_INTERVAL_MS);
    const otherRange = BASE_RATING_RANGE + otherExpansions * RANGE_EXPANSION_PER_INTERVAL;
    const maxRange = Math.max(ratingRange, otherRange);
    return Math.abs(requestingRating - w.rating) <= maxRange;
  });

  if (compatible.length < MATCH_SIZE_MIN) return null;

  // Take up to MATCH_SIZE_MAX, sorted by closest rating
  const sorted = compatible
    .sort((a, b) => Math.abs(a.rating - requestingRating) - Math.abs(b.rating - requestingRating))
    .slice(0, MATCH_SIZE_MAX);

  if (sorted.length < MATCH_SIZE_MIN) return null;

  const matchId = generateMatchId();
  const playerIds = sorted.map(s => s.playerId);
  await db.setMatchFound(playerIds, matchId);

  return matchId;
}
