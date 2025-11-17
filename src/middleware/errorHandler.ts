import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'ValidationError', details: err.flatten() });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) {
    console.error(`[error] ${req.requestId || '-'} ${message}`, err);
  }
  return res.status(status).json({ error: message });
}
