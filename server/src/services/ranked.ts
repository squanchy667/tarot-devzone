import * as db from './dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ddb = DynamoDBDocumentClient.from(client);
const MATCH_HISTORY_TABLE = process.env.DYNAMODB_MATCH_HISTORY_TABLE || 'game-match-history';
const SEASONS_TABLE = process.env.DYNAMODB_SEASONS_TABLE || 'game-seasons';

// ================================================================
// Rank Tier System (T504)
// ================================================================

export interface RankInfo {
  tier: string;
  division: number;
  tierIndex: number;
  minRating: number;
  maxRating: number;
}

const RANK_TIERS = [
  { tier: 'Bronze',   minRating: 0,    maxRating: 999 },
  { tier: 'Silver',   minRating: 1000, maxRating: 1499 },
  { tier: 'Gold',     minRating: 1500, maxRating: 1999 },
  { tier: 'Platinum', minRating: 2000, maxRating: 2499 },
  { tier: 'Diamond',  minRating: 2500, maxRating: 2999 },
  { tier: 'Master',   minRating: 3000, maxRating: 3499 },
  { tier: 'Legend',   minRating: 3500, maxRating: 99999 },
];

export function getRankInfo(rating: number): RankInfo {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    const t = RANK_TIERS[i];
    if (rating >= t.minRating) {
      // 4 divisions within each tier (except Legend)
      const range = t.maxRating - t.minRating;
      const divSize = Math.max(1, Math.floor(range / 4));
      const division = Math.min(4, Math.floor((rating - t.minRating) / divSize) + 1);
      return {
        tier: t.tier,
        division: t.tier === 'Legend' ? 0 : division,
        tierIndex: i,
        minRating: t.minRating,
        maxRating: t.maxRating,
      };
    }
  }
  return { tier: 'Bronze', division: 1, tierIndex: 0, minRating: 0, maxRating: 999 };
}

// ================================================================
// MMR Calculation (T503) — Elo with placement-based adjustments
// ================================================================

const BASE_K = 32;
const PLACEMENT_K = 16; // first 10 games use higher K

interface PlacementEntry {
  playerId: string;
  placement: number;
  playerCount: number;
}

interface MatchResult {
  playerId: string;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  rank: RankInfo;
}

export async function processMatchResult(matchId: string, placements: PlacementEntry[]): Promise<MatchResult[]> {
  const results: MatchResult[] = [];

  // Fetch all player ratings
  const players = await Promise.all(
    placements.map(async (p) => {
      const player = await db.getPlayerById(p.playerId);
      return {
        ...p,
        rating: player?.rating ?? 1000,
        gamesPlayed: player?.gamesPlayed ?? 0,
      };
    })
  );

  const avgRating = players.reduce((sum, p) => sum + p.rating, 0) / players.length;

  for (const player of players) {
    const k = player.gamesPlayed < 10 ? BASE_K + PLACEMENT_K : BASE_K;

    // Expected score based on placement (1st = 1.0, last = 0.0)
    const expectedScore = 1 / (1 + Math.pow(10, (avgRating - player.rating) / 400));

    // Actual score: linear from 1.0 (1st) to 0.0 (last)
    const actualScore = 1 - (player.placement - 1) / Math.max(1, player.playerCount - 1);

    const ratingChange = Math.round(k * (actualScore - expectedScore));
    const newRating = Math.max(0, player.rating + ratingChange);

    await db.updatePlayerRating(player.playerId, newRating);
    await db.updatePlayerStats(player.playerId, player.placement === 1);

    const rank = getRankInfo(newRating);
    results.push({
      playerId: player.playerId,
      oldRating: player.rating,
      newRating,
      ratingChange,
      rank,
    });
  }

  // Store match history
  const now = new Date().toISOString();
  await ddb.send(new PutCommand({
    TableName: MATCH_HISTORY_TABLE,
    Item: {
      matchId,
      timestamp: now,
      playerCount: placements.length,
      results: results.map(r => ({
        playerId: r.playerId,
        placement: placements.find(p => p.playerId === r.playerId)?.placement,
        oldRating: r.oldRating,
        newRating: r.newRating,
        ratingChange: r.ratingChange,
      })),
      // Store each player's reference for GSI query
      playerId: placements[0]?.playerId || 'unknown',
    },
  }));

  // Also store per-player entries for match history GSI
  for (const p of placements) {
    const result = results.find(r => r.playerId === p.playerId);
    await ddb.send(new PutCommand({
      TableName: MATCH_HISTORY_TABLE,
      Item: {
        matchId: `${matchId}#${p.playerId}`,
        playerId: p.playerId,
        timestamp: now,
        placement: p.placement,
        playerCount: p.playerCount,
        ratingChange: result?.ratingChange ?? 0,
        newRating: result?.newRating ?? 1000,
      },
    }));
  }

  return results;
}

// ================================================================
// Leaderboard (T513)
// ================================================================

export async function getLeaderboard(limit: number = 100) {
  // Scan all players and sort by rating (for small scale)
  const res = await ddb.send(new ScanCommand({
    TableName: process.env.DYNAMODB_PLAYERS_TABLE || 'game-players',
    ProjectionExpression: 'playerId, displayName, rating, gamesPlayed, wins, losses',
  }));

  const players = (res.Items || [])
    .filter((p: any) => p.gamesPlayed > 0)
    .sort((a: any, b: any) => b.rating - a.rating)
    .slice(0, limit)
    .map((p: any, i: number) => ({
      rank: i + 1,
      playerId: p.playerId,
      displayName: p.displayName,
      rating: p.rating,
      gamesPlayed: p.gamesPlayed,
      wins: p.wins,
      losses: p.losses,
      rankInfo: getRankInfo(p.rating),
    }));

  return players;
}

// ================================================================
// Match History (T511)
// ================================================================

export async function getMatchHistory(playerId: string, limit: number = 50) {
  const res = await ddb.send(new QueryCommand({
    TableName: MATCH_HISTORY_TABLE,
    IndexName: 'player-matches-index',
    KeyConditionExpression: 'playerId = :pid',
    ExpressionAttributeValues: { ':pid': playerId },
    ScanIndexForward: false, // newest first
    Limit: limit,
  }));

  return res.Items || [];
}

// ================================================================
// Seasons (T505)
// ================================================================

export interface Season {
  seasonId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export async function getCurrentSeason(): Promise<Season | null> {
  const res = await ddb.send(new ScanCommand({
    TableName: SEASONS_TABLE,
    FilterExpression: 'isActive = :t',
    ExpressionAttributeValues: { ':t': true },
  }));

  if (res.Items && res.Items.length > 0) {
    return res.Items[0] as unknown as Season;
  }

  // Auto-create current month's season
  const now = new Date();
  const seasonId = `S${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const season: Season = {
    seasonId,
    name: `Season ${now.toLocaleString('en', { month: 'long', year: 'numeric' })}`,
    startDate,
    endDate,
    isActive: true,
  };

  await ddb.send(new PutCommand({ TableName: SEASONS_TABLE, Item: season as any }));
  return season;
}
