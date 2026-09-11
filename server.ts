import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './src/server/db.js';
import { apiRouter } from './src/server/routes.js';

async function startServer() {
  // Initialize Database & Schema
  initDatabase();

  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Kaushal Setu',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API routes FIRST
  app.use('/api', apiRouter);

  // Catch-all 404 handler for API routes - guarantees API routes never return HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `API endpoint ${req.method} ${req.originalUrl} not found.`
      }
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: 3000, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kaushal Setu] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
