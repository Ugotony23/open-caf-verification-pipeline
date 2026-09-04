import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../db.js';
import { hashPassword, verifyPassword, requireAuth } from '../lib/auth.js';

export const authRouter = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    req.session.userId = user.id;
    res.json({ id: user.id, email: user.email });
  }),
);

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(204).end();
  });
});

authRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    res.json({ id: user.id, email: user.email });
  }),
);

// Only an already-authenticated user can create additional accounts —
// prevents open self-registration once the app is exposed publicly.
authRouter.post(
  '/register',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password || password.length < 8) {
      res.status(400).json({ error: 'email and a password of at least 8 characters are required.' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with that email already exists.' });
      return;
    }

    const user = await prisma.user.create({
      data: { email, passwordHash: await hashPassword(password) },
    });

    req.session.userId = user.id;
    res.status(201).json({ id: user.id, email: user.email });
  }),
);
