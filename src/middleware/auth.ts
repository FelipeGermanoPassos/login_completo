import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.get('authorization');
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, sid: payload.sid };
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
