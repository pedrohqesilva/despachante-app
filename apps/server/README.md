# @despachante/server

Backend Express da aplicacao Despachante App.

## Stack

| Tecnologia | Versao | Descricao        |
| ---------- | ------ | ---------------- |
| Node.js    | 20+    | Runtime          |
| Express    | 4.18   | Framework web    |
| TypeScript | 5.7    | Tipagem estatica |

## Estrutura

```
apps/server/
├── src/
│   ├── config/
│   │   └── index.ts    # Configuracoes do servidor
│   ├── routes/
│   │   └── api.ts      # Endpoints da API
│   └── index.ts        # Entry point
├── tsconfig.json
└── package.json
```

## Desenvolvimento

```bash
# Da raiz do monorepo
pnpm dev:server

# Ou diretamente
cd apps/server
pnpm dev
```

O servidor estara disponivel em `http://localhost:5000`

## Build

```bash
# Da raiz do monorepo
pnpm build:server

# Ou diretamente
cd apps/server
pnpm build
pnpm start
```

## Variaveis de Ambiente

| Variavel | Descricao         | Obrigatorio         |
| -------- | ----------------- | ------------------- |
| `PORT`   | Porta do servidor | Nao (default: 5000) |

## API

| Metodo | Endpoint      | Descricao     |
| ------ | ------------- | ------------- |
| `GET`  | `/health`     | Health check  |
| `GET`  | `/api/status` | Status da API |

## Scripts

| Script           | Descricao                 |
| ---------------- | ------------------------- |
| `pnpm dev`       | Servidor com hot-reload   |
| `pnpm build`     | Compila TypeScript        |
| `pnpm start`     | Executa build de producao |
| `pnpm typecheck` | Verificacao de tipos      |
