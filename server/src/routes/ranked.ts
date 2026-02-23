import { Router, Request, Response } from 'express';
import { gameAuthMiddleware } from './game-auth';
import * as db from '../services/dynamodb';
import * as ranked from '../services/ranked';

export const rankedRouter = Router();

// POST /api/ranked/match-result — Record match result and update MMR
rankedRouter.post('/match-result', gameAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { matchId, placements } = req.body;
    // placements: Array<{ playerId: string; placement: number; playerCount: number }>
    if (!matchId || !placements || !Array.isArray(placements)) {
      return res.status(400).json({ success: false, error: 'matchId and placements array required' });
    }

    const results = await ranked.processMatchResult(matchId, placements);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ranked/profile — Get player ranked profile
rankedRouter.get('/profile', gameAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { playerId } = (req as any).player;
    const player = await db.getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    const rankInfo = ranked.getRankInfo(player.rating);
    res.json({
      success: true,
      data: {
        playerId: player.playerId,
        displayName: player.displayName,
        rating: player.rating,
        gamesPlayed: player.gamesPlayed,
        wins: player.wins,
        losses: player.losses,
        rank: rankInfo,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ranked/leaderboard — Get top 100 players
rankedRouter.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const leaderboard = await ranked.getLeaderboard(100);
    res.json({ success: true, data: leaderboard });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ranked/match-history — Get player's last 50 matches
rankedRouter.get('/match-history', gameAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { playerId } = (req as any).player;
    const history = await ranked.getMatchHistory(playerId, 50);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ranked/season — Get current season info
rankedRouter.get('/season', async (_req: Request, res: Response) => {
  try {
    const season = await ranked.getCurrentSeason();
    res.json({ success: true, data: season });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
