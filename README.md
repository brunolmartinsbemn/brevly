# brev.ly

Encurtador de URL FullStack: cadastro, listagem e remoção de links encurtados, contagem de acessos, exportação de relatório CSV para CDN e redirecionamento do link encurtado para o original.

## Estrutura

| pasta | conteúdo |
|---|---|
| [`server/`](./server) | API (TypeScript, Fastify, Drizzle, Postgres), exportação de CSV para Cloudflare R2 / S3, Dockerfile e `docker-compose.yml` (Back-end + DevOps) |
| [`web/`](./web) | SPA (React, Vite, TypeScript, Tailwind, React Query, React Hook Form, Zod) fiel ao layout do Figma (Front-end) |

## Rodando o projeto

```bash
# 1. infraestrutura + API
cd server
docker compose up -d
cp .env.example .env   # preencher conforme server/README.md
npm install
npm run db:migrate
npm run dev            # http://localhost:3333 (docs em /docs)

# 2. front-end (outro terminal)
cd web
cp .env.example .env   # preencher conforme web/README.md
npm install
npm run dev            # http://localhost:5173
```

Detalhes de cada parte em [`server/README.md`](./server/README.md) e [`web/README.md`](./web/README.md).

## Testes

```bash
cd server && npm test   # 48 testes (banco brevly_test)
cd web && npm test      # 46 testes
```
