import { prisma } from '../prisma/client';
import { config } from '../config';
import { generateRandomToken, sha256Hex } from '../utils/crypto';
import { parseDuration } from '../utils/time';

export async function createRefreshToken(userId: string, userAgent?: string, ip?: string) {
  const token = generateRandomToken(64);
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + parseDuration(config.jwt.refreshTtl));
  const record = await prisma.refreshToken.create({
    data: { userId, tokenHash, userAgent, ip, expiresAt },
  });
  return { token, record };
}

export async function verifyRefreshToken(token: string) {
  const tokenHash = sha256Hex(token);
  const record = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  return record;
}

export async function revokeRefreshToken(id: string, reason?: string) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date(), revokedReason: reason || 'revoked' },
  });
}

export async function rotateRefreshToken(
  oldId: string,
  userId: string,
  userAgent?: string,
  ip?: string,
) {
  await revokeRefreshToken(oldId, 'rotated');
  return createRefreshToken(userId, userAgent, ip);
}

export async function listActiveSessions(userId: string) {
  return prisma.refreshToken.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, userAgent: true, ip: true, createdAt: true, expiresAt: true },
  });
}

export async function revokeAllUserSessions(userId: string, reason = 'reset-password') {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
}
