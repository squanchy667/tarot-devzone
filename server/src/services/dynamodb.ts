import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ddb = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'devzone-users';
const VERSIONS_TABLE = process.env.DYNAMODB_VERSIONS_TABLE || 'devzone-versions';
const PLAYERS_TABLE = process.env.DYNAMODB_PLAYERS_TABLE || 'game-players';
const MATCHMAKING_TABLE = process.env.DYNAMODB_MATCHMAKING_TABLE || 'game-matchmaking';

export async function getUserByEmail(email: string) {
  const res = await ddb.send(new ScanCommand({
    TableName: USERS_TABLE,
    FilterExpression: 'email = :e',
    ExpressionAttributeValues: { ':e': email },
  }));
  return res.Items?.[0] || null;
}

export async function getUserById(userId: string) {
  const res = await ddb.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: { userId },
  }));
  return res.Item || null;
}

export async function createUser(user: { userId: string; email: string; passwordHash: string; role: string; createdAt: string }) {
  await ddb.send(new PutCommand({ TableName: USERS_TABLE, Item: user }));
}

export async function listUsers() {
  const res = await ddb.send(new ScanCommand({ TableName: USERS_TABLE }));
  return (res.Items || []).map(({ passwordHash, ...u }) => u);
}

export async function createVersion(version: { versionId: string; timestamp: string; author: string; description: string; isLive: boolean }) {
  await ddb.send(new PutCommand({ TableName: VERSIONS_TABLE, Item: version }));
}

export async function getVersion(versionId: string) {
  const res = await ddb.send(new GetCommand({
    TableName: VERSIONS_TABLE,
    Key: { versionId },
  }));
  return res.Item || null;
}

export async function listVersions() {
  const res = await ddb.send(new ScanCommand({ TableName: VERSIONS_TABLE }));
  return (res.Items || []).sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));
}

export async function setVersionLive(versionId: string) {
  const versions = await listVersions();
  for (const v of versions) {
    if (v.isLive) {
      await ddb.send(new UpdateCommand({
        TableName: VERSIONS_TABLE,
        Key: { versionId: v.versionId },
        UpdateExpression: 'SET isLive = :f',
        ExpressionAttributeValues: { ':f': false },
      }));
    }
  }
  await ddb.send(new UpdateCommand({
    TableName: VERSIONS_TABLE,
    Key: { versionId },
    UpdateExpression: 'SET isLive = :t',
    ExpressionAttributeValues: { ':t': true },
  }));
}

// ================================================================
// Game Players (separate from DevZone admin users)
// ================================================================

export interface GamePlayer {
  playerId: string;
  email?: string;
  displayName: string;
  passwordHash?: string;
  isGuest: boolean;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  createdAt: string;
}

export async function createPlayer(player: GamePlayer) {
  await ddb.send(new PutCommand({ TableName: PLAYERS_TABLE, Item: player }));
}

export async function getPlayerById(playerId: string) {
  const res = await ddb.send(new GetCommand({
    TableName: PLAYERS_TABLE,
    Key: { playerId },
  }));
  return res.Item as GamePlayer | null;
}

export async function getPlayerByEmail(email: string): Promise<GamePlayer | null> {
  const res = await ddb.send(new QueryCommand({
    TableName: PLAYERS_TABLE,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :e',
    ExpressionAttributeValues: { ':e': email },
  }));
  return (res.Items?.[0] as GamePlayer) || null;
}

export async function updatePlayerProfile(playerId: string, displayName: string) {
  await ddb.send(new UpdateCommand({
    TableName: PLAYERS_TABLE,
    Key: { playerId },
    UpdateExpression: 'SET displayName = :n',
    ExpressionAttributeValues: { ':n': displayName },
  }));
}

export async function updatePlayerStats(playerId: string, won: boolean) {
  const expr = won
    ? 'SET gamesPlayed = gamesPlayed + :one, wins = wins + :one'
    : 'SET gamesPlayed = gamesPlayed + :one, losses = losses + :one';
  await ddb.send(new UpdateCommand({
    TableName: PLAYERS_TABLE,
    Key: { playerId },
    UpdateExpression: expr,
    ExpressionAttributeValues: { ':one': 1 },
  }));
}

export async function updatePlayerRating(playerId: string, newRating: number) {
  await ddb.send(new UpdateCommand({
    TableName: PLAYERS_TABLE,
    Key: { playerId },
    UpdateExpression: 'SET rating = :r',
    ExpressionAttributeValues: { ':r': newRating },
  }));
}

// ================================================================
// Matchmaking Queue
// ================================================================

export interface MatchmakingEntry {
  playerId: string;
  displayName: string;
  rating: number;
  joinedAt: string;
  matchId?: string;
  status: 'waiting' | 'matched';
  ttl: number;
}

export async function joinMatchmaking(entry: MatchmakingEntry) {
  await ddb.send(new PutCommand({ TableName: MATCHMAKING_TABLE, Item: entry }));
}

export async function getMatchmakingEntry(playerId: string): Promise<MatchmakingEntry | null> {
  const res = await ddb.send(new GetCommand({
    TableName: MATCHMAKING_TABLE,
    Key: { playerId },
  }));
  return (res.Item as MatchmakingEntry) || null;
}

export async function removeFromMatchmaking(playerId: string) {
  await ddb.send(new DeleteCommand({
    TableName: MATCHMAKING_TABLE,
    Key: { playerId },
  }));
}

export async function getWaitingPlayers(): Promise<MatchmakingEntry[]> {
  const res = await ddb.send(new ScanCommand({
    TableName: MATCHMAKING_TABLE,
    FilterExpression: '#s = :w',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':w': 'waiting' },
  }));
  return (res.Items || []) as MatchmakingEntry[];
}

export async function setMatchFound(playerIds: string[], matchId: string) {
  for (const playerId of playerIds) {
    await ddb.send(new UpdateCommand({
      TableName: MATCHMAKING_TABLE,
      Key: { playerId },
      UpdateExpression: 'SET #s = :m, matchId = :mid',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':m': 'matched', ':mid': matchId },
    }));
  }
}
