import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const id = uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  const { method, url } = req;
  const ua = req.get('user-agent') || '';
  console.log(`[req] ${id} -> ${method} ${url} ua="${ua}"`);
  res.on('finish', () => {
    const took = Date.now() - start;
    console.log(`[res] ${id} <- ${res.statusCode} (${took}ms)`);
  });
  next();
}
