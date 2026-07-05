import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import * as db from '../services/dynamodb';

export const eventsRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const MIN_EVENTS = 1;
const MAX_EVENTS = 50;
const MAX_BODY_BYTES = 32 * 1024; // ~32KB cap on telemetry payloads
const EVENT_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days
const MAX_TYPE_LENGTH = 64;
const MAX_SESSION_ID_LENGTH = 200;

interface IncomingEvent {
  type: string;
  ts: number;
  sessionId: string;
  props?: Record<string, unknown>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidEvent(e: any): e is IncomingEvent {
  if (!isPlainObject(e)) return false;
  if (typeof e.type !== 'string' || e.type.length === 0 || e.type.length > MAX_TYPE_LENGTH) return false;
  if (typeof e.ts !== 'number' || !Number.isFinite(e.ts) || e.ts <= 0) return false;
  if (typeof e.sessionId !== 'string' || e.sessionId.length === 0 || e.sessionId.length > MAX_SESSION_ID_LENGTH) return false;
  if (e.props !== undefined && !isPlainObject(e.props)) return false;
  return true;
}

// Reuses the game-auth JWT scheme (see routes/game-auth.ts), but a
// missing/invalid token means "anonymous" rather than a rejected request —
// telemetry must keep flowing for logged-out / guest sessions. game-auth's
// own gameAuthMiddleware always 401s on a bad/missing token, so it can't be
// reused as-is; this is the same verify call made optional.
function tryGetPlayerId(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { playerId?: string };
    return typeof payload.playerId === 'string' ? payload.playerId : undefined;
  } catch {
    return undefined;
  }
}

// Lightweight body-size guard for this route only. app.ts's global
// express.json({ limit: '10mb' }) runs before this middleware and app.ts's
// catch-all error handler always responds 500 (it doesn't forward
// body-parser's 413 status), so a route-local limit can't rely on
// body-parser to produce the 413 itself. Checking Content-Length directly
// and returning 413 here keeps the contract explicit for this endpoint.
function enforceBodySizeLimit(req: Request, res: Response, next: NextFunction) {
  const contentLength = Number(req.headers['content-length']);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({ success: false, error: `Request body exceeds ${MAX_BODY_BYTES}-byte limit` });
  }
  next();
}

eventsRouter.use(enforceBodySizeLimit);

// POST /api/events — Telemetry ingestion (JWT optional; anonymous allowed)
eventsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { events, clientVersion, schemaVersion } = req.body || {};

    if (!Array.isArray(events) || events.length < MIN_EVENTS || events.length > MAX_EVENTS) {
      return res.status(400).json({ success: false, error: `events must be an array of ${MIN_EVENTS}-${MAX_EVENTS} items` });
    }
    if (clientVersion !== undefined && typeof clientVersion !== 'string') {
      return res.status(400).json({ success: false, error: 'clientVersion must be a string' });
    }
    if (schemaVersion !== undefined && typeof schemaVersion !== 'number') {
      return res.status(400).json({ success: false, error: 'schemaVersion must be a number' });
    }
    for (const e of events) {
      if (!isValidEvent(e)) {
        return res.status(400).json({
          success: false,
          error: 'Each event requires type (non-empty string, max 64 chars), ts (positive number), sessionId (non-empty string, max 200 chars), and optional props (object)',
        });
      }
    }

    const playerId = tryGetPlayerId(req);
    const ttl = Math.floor(Date.now() / 1000) + EVENT_TTL_SECONDS;

    const items: db.GameEventItem[] = (events as IncomingEvent[]).map((e) => ({
      pk: `session#${e.sessionId}`,
      sk: `${e.ts}#${randomUUID()}`,
      type: e.type,
      ts: e.ts,
      sessionId: e.sessionId,
      ttl,
      ...(e.props !== undefined ? { props: e.props } : {}),
      ...(playerId !== undefined ? { playerId } : {}),
      ...(clientVersion !== undefined ? { clientVersion } : {}),
      ...(schemaVersion !== undefined ? { schemaVersion } : {}),
    }));

    await db.putGameEvents(items);

    res.json({ success: true, data: { accepted: items.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
