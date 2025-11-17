import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client';
import { config } from '../config';
import { signAccessToken } from '../utils/jwt';
import {
  createRefreshToken,
  listActiveSessions,
  revokeRefreshToken,
  rotateRefreshToken,
} from './tokenService';

export async function registerUser(name: string, email: string, password: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    const err: any = new Error('Email já cadastrado');
    err.status = 400;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  return user;
}

export async function authenticateUser(
  email: string,
  password: string,
  userAgent?: string,
  ip?: string,
) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err: any = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err: any = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  const { token: refreshToken, record } = await createRefreshToken(user.id, userAgent, ip);
  const accessToken = signAccessToken({ sub: user.id, email: user.email, sid: record.id });
  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
    sessionId: record.id,
  };
}

export async function refreshSession(
  providedRefreshToken: string,
  userAgent?: string,
  ip?: string,
) {
  // Feito nas rotas via tokenService.verify? Aqui só rotacionamos por id conhecido
  // Esta função espera que a rota já tenha validado e buscado o registro
}

export async function logout(userId: string, refreshTokenId: string) {
  const rt = await prisma.refreshToken.findUnique({ where: { id: refreshTokenId } });
  if (!rt || rt.userId !== userId) {
    const err: any = new Error('Sessão não encontrada');
    err.status = 404;
    throw err;
  }
  await revokeRefreshToken(refreshTokenId, 'logout');
}

export async function sessions(userId: string) {
  return listActiveSessions(userId);
}

export async function revokeSession(userId: string, sessionId: string) {
  const rt = await prisma.refreshToken.findUnique({ where: { id: sessionId } });
  if (!rt || rt.userId !== userId) {
    const err: any = new Error('Sessão não encontrada');
    err.status = 404;
    throw err;
  }
  await revokeRefreshToken(sessionId, 'user-revoked');
}
