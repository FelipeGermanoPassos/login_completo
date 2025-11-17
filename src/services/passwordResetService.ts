import { prisma } from '../prisma/client';
import { generateRandomToken, sha256Hex } from '../utils/crypto';
import { parseDuration } from '../utils/time';
import { config } from '../config';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const RESET_TTL = '1h';

export async function createPasswordReset(email: string, baseUrl: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Responder sempre 200 para não vazar existência do e-mail
  if (!user) return;

  const token = generateRandomToken(48);
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + parseDuration(RESET_TTL));
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
  const tmpDir = path.join(process.cwd(), 'tmp');
  try { fs.mkdirSync(tmpDir, { recursive: true }); } catch {}
  fs.writeFileSync(path.join(tmpDir, 'last_password_reset_link.txt'), resetLink, 'utf8');
  console.log(`[password-reset] Link gerado para ${email}: ${resetLink}`);
}

export async function resetPassword(useToken: string, newPassword: string) {
  const tokenHash = sha256Hex(useToken);
  const prt = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!prt) {
    const err: any = new Error('Token inválido ou expirado');
    err.status = 400;
    throw err;
  }
  const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
  await prisma.$transaction([
    prisma.user.update({ where: { id: prt.userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId: prt.userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: 'reset-password' },
    }),
    prisma.passwordResetToken.update({ where: { id: prt.id }, data: { usedAt: new Date() } }),
  ]);
}
