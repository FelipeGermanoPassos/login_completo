# Login Completo (Node.js + TypeScript)

API de autenticação completa com Registro, Login, Recuperação de Senha, JWT, Refresh Token e Controle de Sessão.

## Stack

- Node.js + TypeScript + Express
- Prisma ORM + SQLite (dev)
- JWT (access) + Refresh Tokens com rotação
- Zod (validação), bcrypt (hash de senha)
- Rate limiting em rotas sensíveis

## Como rodar

1. Copie variáveis de ambiente:

```
cp .env.example .env
```

Edite se necessário (`PORT`, segredos JWT, etc.). Em dev, segredos são gerados automaticamente se não definidos.

2. Instale dependências:

```
npm install
```

3. Gere o Prisma Client e rode migrações:

```
npx prisma generate
npx prisma migrate dev --name init
```

4. Suba o servidor em dev:

```
npm run dev
```

API: `http://localhost:3000`

## Endpoints principais

- POST `/auth/register` { name, email, password }
- POST `/auth/login` { email, password }
- POST `/auth/refresh` { refreshToken }
- POST `/auth/logout` { refreshTokenId } (autenticado)
- GET `/auth/sessions` (autenticado)
- POST `/auth/sessions/:id/revoke` (autenticado)
- POST `/auth/forgot-password` { email }
- POST `/auth/reset-password` { token, password }
- GET `/me` (autenticado)
- GET `/health`

Observações:

- Access token expira em `ACCESS_TOKEN_TTL` (padrão 15m).
- Refresh token expira em `REFRESH_TOKEN_TTL` (padrão 7d) e é ROTACIONADO a cada refresh; o anterior é revogado.
- Controle de sessão: cada refresh token ativo é uma sessão (com user-agent e IP). Você pode listá-las e revogar individualmente.
- Recuperação de senha: o link é logado no console e salvo em `./tmp/last_password_reset_link.txt`.

## Testes rápidos (REST Client)

Use `requests.http` (extensão REST Client do VS Code) para sequências prontas.

## Variáveis de ambiente

Veja `.env.example`:

- `PORT=3000`
- `DATABASE_URL="file:./dev.db"`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL=15m`, `REFRESH_TOKEN_TTL=7d`
- `BCRYPT_SALT_ROUNDS=10`

## Scripts

- `npm run dev` – desenvolvimento com reload
- `npm run build` – build TypeScript para `dist/`
- `npm start` – executa build em produção
- `npm run prisma:generate` – gera Prisma Client
- `npm run prisma:migrate` – roda migrações em dev

## Notas de segurança

- Em produção, defina segredos fortes no `.env` e use HTTPS.
- Considere cookies httpOnly/secure para refresh token se optar por armazená-lo no navegador.
- Access tokens são curtos; revogações ocorrem via sessões (refresh tokens).

# login_completo

Sistema de Autenticação Completo
