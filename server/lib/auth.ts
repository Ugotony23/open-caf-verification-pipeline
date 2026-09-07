import bcrypt from 'bcryptjs';
import dns from 'node:dns/promises';
import type { Request, Response, NextFunction } from 'express';

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_FORMAT.test(email);
}

// Confirms the email's domain can actually receive mail (has MX records, or
// at minimum resolves at all). Catches typos like "gmial.com" or made-up
// domains without sending any mail — it cannot confirm the specific mailbox
// exists, only that the domain is real and mail-capable.
export async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  if (!domain) return false;
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    try {
      await dns.resolve(domain);
      return true;
    } catch {
      return false;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  next();
}
