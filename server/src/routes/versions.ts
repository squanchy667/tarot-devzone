import { Router } from 'express';
import * as db from '../services/dynamodb';
import * as versionService from '../services/version';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const versionsRouter = Router();
versionsRouter.use(authMiddleware);

versionsRouter.get('/', async (_req, res) => {
  try {
    const versions = await db.listVersions();
    res.json({ success: true, data: versions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

versionsRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const { description } = req.body;
    const author = req.user?.email || 'unknown';
    const versionId = await versionService.createVersionSnapshot(author, description || 'No description');
    res.json({ success: true, data: { versionId } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

versionsRouter.post('/:id/publish', async (req, res) => {
  try {
    await versionService.publishVersion(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

versionsRouter.post('/:id/rollback', async (req, res) => {
  try {
    await versionService.publishVersion(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

versionsRouter.get('/:id/diff', async (req, res) => {
  try {
    const diff = await versionService.diffVersion(req.params.id);
    res.json({ success: true, data: diff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
