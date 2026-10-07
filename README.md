<p align="center">
  <img src="https://avatars.githubusercontent.com/u/28929274?s=120&v=4" alt="Rocketseat" width="96" />
</p>

<h1 align="center">brev.ly</h1>

<p align="center">
  Encurtador de URL FullStack — desafio final Rocketseat (Front-end, Back-end e DevOps)
</p>

---

## Objetivo

Aplicação FullStack que permite o **cadastro, listagem e remoção de links encurtados**, a **geração de relatório dos acessos** de cada link em CSV e o **redirecionamento** correto do link encurtado para o link original.

| pasta | conteúdo |
|---|---|
| [`server/`](./server) | API em TypeScript + Fastify + Drizzle + Postgres, exportação de CSV para CDN (Cloudflare R2 / S3), Dockerfile e `docker-compose.yml` — **Back-end + DevOps** |
| [`web/`](./web) | SPA em React + Vite + TypeScript + Tailwind, fiel ao layout do Figma — **Front-end** |

## Tarefas

### Back-end

- [x] Deve ser possível criar um link
- [x] Não deve ser possível criar um link com URL encurtada mal formatada
- [x] Não deve ser possível criar um link com URL encurtada já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio de uma URL encurtada
- [x] Deve ser possível listar todas as URL's cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível exportar os links criados em um CSV
- [x] Deve ser possível acessar o CSV por meio de uma CDN (Amazon S3, Cloudflare R2, etc)
- [x] Deve ser gerado um nome aleatório e único para o arquivo
- [x] Deve ser possível realizar a listagem de forma performática
- [x] O CSV deve ter campos como URL original, URL encurtada, contagem de acessos e data de criação

### Front-end

- [x] Deve ser possível criar um link
- [x] Não deve ser possível criar um link com encurtamento mal formatado
- [x] Não deve ser possível criar um link com encurtamento já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio do encurtamento
- [x] Deve ser possível listar todas as URL's cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível baixar um CSV com o relatório dos links criados
- [x] Aplicação React no formato SPA utilizando o Vite como bundler
- [x] Seguir o mais fielmente possível o layout do Figma
- [x] Elementos de boa experiência (empty state, ícones de carregamento, bloqueio de ações conforme o estado)
- [x] Responsividade: bom uso em desktops e celulares

### Requisitos gerais

- [x] TypeScript, Fastify, Drizzle e Postgres no back-end
- [x] TypeScript, React e Vite (sem framework) no front-end
- [x] Arquivo `.env.example` em `server/` e `web/`
- [x] Script `db:migrate` para executar as migrations
- [x] Dockerfile da API seguindo boas práticas (multi-stage, usuário não-root)
- [x] CORS habilitado

## O que foi feito

**Back-end**

- Operações sobre um link usam o **código encurtado** (`shortUrl`) de forma consistente: buscar, incrementar e deletar.
- Validação com Zod: código encurtado com letras, números, `-` e `_` (3 a 50 caracteres) e URL original apenas `http`/`https`. Formato inválido → `400`, código existente → `409`.
- Incremento de acessos atômico no banco (sem perda em acessos simultâneos).
- Listagem **paginada por cursor** (`created_at` + `id`) com índice composto — custo constante por página, sem `OFFSET`.
- Exportação do CSV **em stream** (banco → CSV → upload), sem carregar tudo em memória, com nome `uuid-timestamp.csv` e download direto pela URL pública da CDN.
- Documentação da API com Swagger em `/docs`.
- 48 testes automatizados (Vitest) contra um banco Postgres de teste.

**Front-end**

- Tema com as cores, tipografia (Open Sans e Quicksand) e ícones do Figma; estados de foco, erro, hover e desabilitado conforme o Style Guide.
- Página inicial com formulário e lista, página de redirecionamento e página de link não encontrado — desktop e mobile, comparadas pixel a pixel com o Figma.
- Lista com scroll infinito, estados de carregando, vazio e erro; copiar link, apagar com confirmação e baixar CSV com bloqueio contra clique duplo.
- O acesso é contado exatamente uma vez por visita ao link encurtado.
- 46 testes automatizados (Vitest + Testing Library).

## Como rodar

### Pré-requisitos

- Node.js 22+
- Docker

### 1. Infraestrutura e API

```bash
cd server
docker compose up -d       # Postgres (bancos brevly e brevly_test) + MinIO (S3 local)
cp .env.example .env       # preencher (valores locais abaixo)
npm install
npm run db:migrate
npm run dev                # http://localhost:3333 — docs em /docs
```

Valores do `server/.env` para a infraestrutura local:

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

Para usar o **Cloudflare R2**: crie o bucket, ative a URL pública (r2.dev), crie um token com permissão *Object Read & Write*, preencha as chaves `CLOUDFLARE_*` e deixe `CLOUDFLARE_ENDPOINT` vazio.

### 2. Front-end

Em outro terminal:

```bash
cd web
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Valores do `web/.env`:

```
VITE_FRONTEND_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:3333
```

### Testes

```bash
cd server && npm test      # aplica as migrations no banco de teste e roda a suíte
cd web && npm test
```

### Docker (API)

```bash
cd server
docker build -t brevly-server .
docker run -p 3333:3333 --env-file .env brevly-server
```

## API

| método | rota | descrição |
|---|---|---|
| `POST` | `/links` | cria um link (`originalUrl`, `shortUrl`) |
| `GET` | `/links?cursor=&pageSize=` | lista paginada, mais novos primeiro |
| `GET` | `/links/:shortUrl` | obtém a URL original |
| `PATCH` | `/links/:shortUrl/access` | incrementa os acessos |
| `DELETE` | `/links/:shortUrl` | remove o link |
| `POST` | `/links/exports` | gera o CSV e retorna `reportUrl` |

## Páginas

| rota | descrição |
|---|---|
| `/` | cadastro e listagem de links |
| `/:url-encurtada` | busca a URL original, conta o acesso e redireciona |
| qualquer outra | página de link não encontrado |
