# brev.ly — server

API do encurtador brev.ly (Fastify + Drizzle + Postgres).

## Rodando localmente

```bash
# na raiz do repositório: Postgres (bancos brevly e brevly_test) + MinIO (bucket público brevly)
docker compose up -d

# em server/
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Valores do `.env` para a infra local do `docker-compose`:

```
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/brevly
CLOUDFLARE_ACCOUNT_ID=local
CLOUDFLARE_ACCESS_KEY_ID=minioadmin
CLOUDFLARE_SECRET_ACCESS_KEY=minioadmin
CLOUDFLARE_BUCKET=brevly
CLOUDFLARE_PUBLIC_URL=http://localhost:9000/brevly
CLOUDFLARE_ENDPOINT=http://localhost:9000
```

Para usar o Cloudflare R2, preencha as chaves `CLOUDFLARE_*` com os dados do bucket e deixe `CLOUDFLARE_ENDPOINT` vazio.

Docs da API: http://localhost:3333/docs

## Testes

```bash
npm test   # aplica migrations no banco brevly_test e roda a suíte
```

## Docker

```bash
docker build -t brevly-server .
docker run -p 3333:3333 --env-file .env brevly-server
```

As migrations rodam fora do container, com `npm run db:migrate`.

## Rotas

| método | rota | descrição |
|---|---|---|
| POST | /links | cria link (`originalUrl`, `shortUrl`) |
| GET | /links?cursor=&pageSize= | lista paginada (mais novos primeiro) |
| GET | /links/:shortUrl | URL original |
| PATCH | /links/:shortUrl/access | incrementa acessos |
| DELETE | /links/:shortUrl | remove link |
| POST | /links/exports | gera CSV e retorna `reportUrl` |
