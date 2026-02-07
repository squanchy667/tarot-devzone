import { Router } from 'express';
import multer from 'multer';
import * as s3 from '../services/s3';
import { authMiddleware } from '../middleware/auth';

export const imagesRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

imagesRouter.use(authMiddleware);

imagesRouter.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const name = req.body.name || req.file.originalname.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
    const key = `live/images/${name}`;
    const url = await s3.uploadBuffer(key, req.file.buffer, req.file.mimetype);
    res.json({ success: true, data: { url, key } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

imagesRouter.post('/presign', async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ success: false, error: 'filename and contentType required' });
    }
    const key = `live/images/${filename}`;
    const url = await s3.getUploadUrl(key, contentType);
    res.json({ success: true, data: { uploadUrl: url, key } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

imagesRouter.delete('/:key(*)', async (req, res) => {
  try {
    await s3.deleteObject(req.params.key);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
