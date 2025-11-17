import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

function devSecret(name: string) {
  const s = crypto.randomBytes(32).toString('hex');
  // Evita prints excessivos: apenas quando realmente não definido
  console.warn(`[config] ${name} não definido em .env; usando segredo gerado para DEV.`);
  return s;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  dbUrl: process.env.DATABASE_URL || 'file:./dev.db',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || devSecret('JWT_ACCESS_SECRET'),
    refreshSecret: process.env.JWT_REFRESH_SECRET || devSecret('JWT_REFRESH_SECRET'),
    accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
};
