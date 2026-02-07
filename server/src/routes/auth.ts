import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from '../services/dynamodb';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = 86400; // 24 hours in seconds

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash as string);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.json({ success: true, data: { token, user: { userId: user.userId, email: user.email, role: user.role } } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.post('/register', authMiddleware, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const { email, password, role = 'editor' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      userId: generateId(),
      email,
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
    };
    await db.createUser(user);
    res.json({ success: true, data: { userId: user.userId, email, role } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ success: true, data: req.user });
});
