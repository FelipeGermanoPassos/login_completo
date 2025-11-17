import { Router } from 'express';
import { z } from 'zod';
import { authGuard } from '../middleware/auth';
import { loginLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter';
import { prisma } from '../prisma/client';
import { authenticateUser, registerUser, revokeSession, sessions, logout } from '../services/authService';
import { createPasswordReset, resetPassword } from '../services/passwordResetService';
import { rotateRefreshToken, verifyRefreshToken } from '../services/tokenService';
import { signAccessToken } from '../utils/jwt';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post('/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const user = await registerUser(name, email, password);
    return res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
authRouter.post('/auth/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const ua = req.get('user-agent') || undefined;
    const ip = req.ip;
    const result = await authenticateUser(email, password, ua, ip);
    return res.json(result);
  } catch (e) {
    next(e);
  }
});

const refreshSchema = z.object({ refreshToken: z.string().min(20) });
authRouter.post('/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const record = await verifyRefreshToken(refreshToken);
    if (!record) return res.status(401).json({ error: 'Invalid or expired refresh token' });
    const ua = req.get('user-agent') || undefined;
    const ip = req.ip;
    const { token: newRefresh, record: newRecord } = await rotateRefreshToken(
      record.id,
      record.userId,
      ua,
      ip,
    );
    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const accessToken = signAccessToken({ sub: user.id, email: user.email, sid: newRecord.id });
    return res.json({ accessToken, refreshToken: newRefresh });
  } catch (e) {
    next(e);
  }
});

// Logout revoga o refresh token atual (passado no corpo)
const logoutSchema = z.object({ refreshTokenId: z.string().min(10) });
authRouter.post('/auth/logout', authGuard, async (req, res, next) => {
  try {
    const { refreshTokenId } = logoutSchema.parse(req.body);
    await logout(req.user!.id, refreshTokenId);
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

authRouter.get('/auth/sessions', authGuard, async (req, res, next) => {
  try {
    const list = await sessions(req.user!.id);
    return res.json(list);
  } catch (e) {
    next(e);
  }
});

authRouter.post('/auth/sessions/:id/revoke', authGuard, async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    await revokeSession(req.user!.id, sessionId);
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

const forgotSchema = z.object({ email: z.string().email() });
authRouter.post('/auth/forgot-password', forgotPasswordLimiter, async (req, res, next) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    await createPasswordReset(email, baseUrl);
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

const resetSchema = z.object({ token: z.string().min(20), password: z.string().min(6) });
authRouter.post('/auth/reset-password', async (req, res, next) => {
  try {
    const { token, password } = resetSchema.parse(req.body);
    await resetPassword(token, password);
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
