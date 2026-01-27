# Despachante App

Monorepo para a aplicacao Despachante App.

## Stack

| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| pnpm | 9+ | Package manager |
| Turborepo | 2.3+ | Build system |
| Node.js | 20+ | Runtime |
| TypeScript | 5.7 | Tipagem estatica |

## Estrutura

```
despachante-app/
├── apps/
│   ├── web/          # Frontend React + Vite
│   └── server/       # Backend Express
├── packages/
│   ├── convex/       # Backend Convex (auth, database)
│   └── shared/       # Tipos compartilhados
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Requisitos

- Node.js >= 20.0.0
- pnpm >= 9.0.0

## Instalacao

```bash
pnpm install
```

## Desenvolvimento

```bash
# Iniciar todos os apps
pnpm dev

# Iniciar apenas o web
pnpm dev:web

# Iniciar apenas o server
pnpm dev:server

# Iniciar Convex dev
pnpm convex:dev
```

## Build

```bash
# Build de todos os apps
pnpm build

# Build individual
pnpm build:web
pnpm build:server
```

## Scripts

| Script | Descricao |
|--------|-----------|
| `pnpm dev` | Inicia todos os apps em modo desenvolvimento |
| `pnpm dev:web` | Inicia apenas o frontend |
| `pnpm dev:server` | Inicia apenas o backend |
| `pnpm build` | Build de producao |
| `pnpm lint` | Executa linting em todos os packages |
| `pnpm typecheck` | Verificacao de tipos |
| `pnpm clean` | Limpa builds e node_modules |
| `pnpm convex:dev` | Inicia Convex em modo desenvolvimento |
| `pnpm convex:deploy` | Deploy do Convex |

## Packages

| Package | Descricao |
|---------|-----------|
| `@despachante/web` | Frontend React com Vite |
| `@despachante/server` | Backend Express |
| `@despachante/convex` | Funcoes e schema Convex |
| `@despachante/shared` | Tipos TypeScript compartilhados |
