import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { cardsRouter } from './routes/cards';
import { synergiesRouter } from './routes/synergies';
import { configRouter } from './routes/config';
import { themeRouter } from './routes/theme';
import { imagesRouter } from './routes/images';
import { versionsRouter } from './routes/versions';
import { deployRouter } from './routes/deploy';

export const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/synergies', synergiesRouter);
app.use('/api/config', configRouter);
app.use('/api/theme', themeRouter);
app.use('/api/images', imagesRouter);
app.use('/api/versions', versionsRouter);
app.use('/api/deploy', deployRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Error]', err.message);
  res.status(500).json({ success: false, error: err.message });
});
