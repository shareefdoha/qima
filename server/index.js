import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config(); // must run before any module reads process.env

import { assertDbConnection } from './db/pool.js';
import authRoutes from './routes/auth.js';
import aboutRoutes from './routes/about.js';
import bannerRoutes from './routes/banners.js';
import teamRoutes from './routes/team.js';
import eventRoutes from './routes/events.js';
import galleryRoutes from './routes/gallery.js';
import settingRoutes from './routes/settings.js';
import contactRoutes from './routes/contact.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../client/dist');

app.set('trust proxy', 1); // correct client IPs behind nginx, for the rate limiters

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow server-to-server / curl (no Origin header) and any allow-listed site
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return cb(null, true);
      return cb(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ---------------------------------------------------------------- routes ----
app.get('/api/health', async (_req, res) => {
  try {
    await assertDbConnection();
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'unreachable', error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/contact', contactRoutes);

// Keep unknown API requests as JSON errors instead of returning the React app.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// In production Express serves the Vite build as a single full-stack app.
// The wildcard fallback lets React Router handle direct URLs such as /admin.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });
}

// ------------------------------------------------------- error handling ----
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[API error]', err);

  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'That record already exists.' });
  }
  if (err?.code === 'ECONNREFUSED' || err?.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({ error: 'Database unavailable. Check your MySQL connection settings.' });
  }
  if (err?.message?.includes('not allowed by CORS')) {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

// ------------------------------------------------------------- bootstrap ----
app.listen(PORT, async () => {
  console.log(`\n  QIMA API listening on http://localhost:${PORT}`);
  console.log(`  CORS origins: ${allowedOrigins.join(', ')}`);
  try {
    await assertDbConnection();
    console.log('  MySQL: connected\n');
  } catch (err) {
    console.warn(`  MySQL: NOT connected — ${err.message}`);
    console.warn('  Run `npm run db:setup` after configuring .env\n');
  }
});

export default app;
