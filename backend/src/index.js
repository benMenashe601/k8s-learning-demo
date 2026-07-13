const express = require('express');
const os = require('os');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT || 4000);
const appName = process.env.APP_NAME || 'Kubernetes Lab';
const appMessage = process.env.APP_MESSAGE || 'The backend is alive.';
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://demo:demo@database:5432/demo',
});

app.disable('x-powered-by');
app.use(express.json());

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/api/health/live', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'not-ready', database: 'disconnected' });
  }
});

app.post('/api/visits', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `INSERT INTO visits (source)
       VALUES ($1)
       RETURNING id, created_at`,
      [os.hostname()]
    );
    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM visits');

    res.status(201).json({
      appName,
      message: appMessage,
      backendPod: os.hostname(),
      database: 'connected',
      visit: result.rows[0],
      totalVisits: countResult.rows[0].count,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/visits', async (_req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, source, created_at FROM visits ORDER BY created_at DESC LIMIT 8'
    );
    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM visits');
    res.json({ visits: result.rows, totalVisits: countResult.rows[0].count });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    status: 'error',
    message: 'The backend could not reach the database.',
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`${appName} backend listening on port ${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  await pool.end();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
