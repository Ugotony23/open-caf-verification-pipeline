import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import { createServer as createViteServer } from 'vite';
import { apiRouter, errorHandler } from './server/routes/api.js';
import { authRouter } from './server/routes/auth.js';
import { requireAuth } from './server/lib/auth.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not set. Add it to your .env file.');
  }

  // Global Middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  // Mount API Routes — auth endpoints are open, everything else requires a session
  app.use('/api/auth', authRouter);
  app.use('/api', requireAuth, apiRouter);

  // API Error Handler
  app.use('/api', errorHandler);
  app.use(errorHandler);

  // Vite middleware for development / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`Open CAF Verification Pipeline server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
