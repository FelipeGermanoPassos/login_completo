import { config } from './config';
import { buildApp } from './app';
import { prisma } from './prisma/client';

async function main() {
  await prisma.$connect();
  const app = buildApp();
  app.listen(config.port, () => {
    console.log(`API rodando em http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Falha ao iniciar a aplicação:', err);
  process.exit(1);
});
