# @despachante/web

Frontend React da aplicacao Despachante App.

## Stack

| Tecnologia   | Versao | Descricao        |
| ------------ | ------ | ---------------- |
| React        | 19     | UI Library       |
| Vite         | 6      | Build tool       |
| TypeScript   | 5.7    | Tipagem estatica |
| Tailwind CSS | 4      | Estilizacao      |
| React Router | 7      | Roteamento       |
| Convex       | 1.31   | Backend/Auth     |
| shadcn/ui    | -      | Componentes UI   |

## Estrutura

```
apps/web/
├── src/
│   ├── components/     # Componentes React
│   │   ├── ui/         # Componentes shadcn/ui
│   │   └── app-*/      # Componentes de layout
│   ├── config/         # Configuracoes (menu, etc)
│   ├── context/        # React Contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitarios
│   ├── pages/          # Paginas da aplicacao
│   ├── App.tsx         # Componente principal
│   ├── Router.tsx      # Configuracao de rotas
│   └── main.tsx        # Entry point
├── convex/             # Configuracao Convex local
├── public/             # Assets estaticos
└── package.json
```

## Desenvolvimento

```bash
# Da raiz do monorepo
pnpm dev:web

# Ou diretamente
cd apps/web
pnpm dev
```

O app estara disponivel em `http://localhost:5173`

## Build

```bash
# Da raiz do monorepo
pnpm build:web

# Ou diretamente
cd apps/web
pnpm build
pnpm preview
```

## Variaveis de Ambiente

Crie um arquivo `.env` em `apps/web/`:

| Variavel            | Descricao               | Obrigatorio |
| ------------------- | ----------------------- | ----------- |
| `VITE_APP_NAME`     | Nome da aplicacao       | Nao         |
| `VITE_CONVEX_URL`   | URL do Convex Cloud     | Sim         |
| `CONVEX_DEPLOYMENT` | ID do deployment Convex | Sim         |

## Autenticacao

O app usa Convex Auth com provider de Password:

- Login/Signup via email e senha
- Sessao gerenciada pelo Convex
- Rotas protegidas via `ProtectedRoute`

## Scripts

| Script           | Descricao                   |
| ---------------- | --------------------------- |
| `pnpm dev`       | Servidor de desenvolvimento |
| `pnpm build`     | Build de producao           |
| `pnpm preview`   | Preview do build            |
| `pnpm lint`      | Executa ESLint              |
| `pnpm typecheck` | Verificacao de tipos        |
