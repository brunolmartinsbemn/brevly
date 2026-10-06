# brev.ly — web

SPA React + Vite do encurtador brev.ly.

## Rodando localmente

1. Suba a API (ver `../server/README.md`).
2. Em `web/`, crie o `.env` a partir do `.env.example`:

```
VITE_FRONTEND_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:3333
```

3. Instale e rode:

```bash
npm install
npm run dev
```

## Testes

```bash
npm test
```

## Páginas

| rota | descrição |
|---|---|
| `/` | cadastro e listagem de links |
| `/:url-encurtada` | busca a URL original, conta o acesso e redireciona |
| qualquer outra | página de link não encontrado |
