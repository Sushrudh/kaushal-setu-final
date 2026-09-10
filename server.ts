import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { initDatabase } from './server/db.js';
import { apiRouter } from './server/api.js';

dotenv.config();

// Initialize Database Schema & Seed Data
initDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mount API routes FIRST
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Kaushal Setu Full-Stack Gateway',
      timestamp: new Date().toISOString()
    });
  });

  // Serve uploaded files statically
  const uploadDir = path.join(process.cwd(), 'data', 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Vite middleware for development vs production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kaushal Setu Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
