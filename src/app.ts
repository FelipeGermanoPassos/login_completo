import express from 'express';
import path from 'path';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { meRouter } from './routes/me';

export function buildApp() {
  const app = express();

  app.set('trust proxy', true);
  app.use(express.json());
  app.use(requestLogger);

  // Static files (simple demo page)
  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir));

  // Basic index
  app.get('/', (_req, res) => {
    res.status(200).send('API de Autenticação ativa. Veja /health ou abra /login.');
  });

  // Friendly alias for login page
  app.get('/login', (_req, res) => {
    res.sendFile(path.join(publicDir, 'login.html'));
  });

  // Routers
  app.use(healthRouter);
  app.use(authRouter);
  app.use(meRouter);

  // Error handler
  app.use(errorHandler);

  return app;
}
import express from 'express';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { meRouter } from './routes/me';

export function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);

  app.use(healthRouter);
  app.use(authRouter);
  app.use(meRouter);

  app.use(errorHandler);
  return app;
}
