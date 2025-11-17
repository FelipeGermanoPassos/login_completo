import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { config } from '../config';

type AccessPayload = {
  sub: string; // userId
  sid?: string; // session id (id do refresh token)
  email?: string;
};

export function signAccessToken(payload: AccessPayload) {
  const options: SignOptions = { expiresIn: config.jwt.accessTtl as any };
  const token = jwt.sign(payload, config.jwt.accessSecret as Secret, options);
  return token;
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, config.jwt.accessSecret as Secret) as AccessPayload;
}
