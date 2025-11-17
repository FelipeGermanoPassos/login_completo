import crypto from 'crypto';

export function generateRandomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function sha256Hex(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}
