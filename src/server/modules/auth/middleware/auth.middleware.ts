import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../model/auth.model';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const JWT_SECRET = process.env['JWT_SECRET'] || 'fallback-secret';

/**
 * Middleware that verifies JWT from the Authorization header.
 * Attaches the decoded user to `req.user`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Signs a JWT for the given user payload.
 */
export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
