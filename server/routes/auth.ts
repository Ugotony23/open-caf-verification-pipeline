import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../db.js';
import { hashPassword, verifyPassword, isValidEmailFormat, domainAcceptsMail, generateVerificationToken } from '../lib/auth.js';
import { sendVerificationEmail } from '../lib/mailer.js';

export const authRouter = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const { password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ error: 'Please verify your email before signing in — check your inbox for the verification link.' });
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

// Open self-registration: anyone who can reach this server can create an
// account. The account isn't usable until they click the verification link
// sent to the address they gave — that's what actually confirms the mailbox
// is real, which a domain-only check cannot.
authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const { password } = req.body ?? {};
    if (!email || !password || password.length < 8) {
      res.status(400).json({ error: 'email and a password of at least 8 characters are required.' });
      return;
    }

    if (!isValidEmailFormat(email)) {
      res.status(400).json({ error: 'That doesn\'t look like a valid email address.' });
      return;
    }

    if (!(await domainAcceptsMail(email))) {
      res.status(400).json({ error: 'That email domain doesn\'t appear to be able to receive mail — check for a typo.' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with that email already exists.' });
      return;
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        emailVerified: false,
        verificationToken,
        verificationTokenExpiresAt,
      },
    });

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/api/auth/verify?token=${verificationToken}`;

    try {
      await sendVerificationEmail(email, verifyUrl);
    } catch (err) {
      // Roll back the account if we couldn't send the verification email —
      // otherwise it's stuck permanently unverifiable.
      await prisma.user.delete({ where: { email } });
      throw err;
    }

    res.status(201).json({ message: 'Account created. Check your email for a verification link before signing in.' });
  }),
);

authRouter.get(
  '/verify',
  asyncHandler(async (req, res) => {
    const token = String(req.query.token ?? '');
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    if (!token) {
      res.redirect(`${appUrl}/?verified=0`);
      return;
    }

    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user || !user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
      res.redirect(`${appUrl}/?verified=0`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null, verificationTokenExpiresAt: null },
    });

    res.redirect(`${appUrl}/?verified=1`);
  }),
);
