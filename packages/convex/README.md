# @despachante/convex

Backend Convex da aplicacao Despachante App.

## Stack

| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| Convex | 1.31 | Backend as a Service |
| @convex-dev/auth | 0.0.90 | Autenticacao |

## Estrutura

```
packages/convex/
├── convex/
│   ├── _generated/     # Arquivos gerados pelo Convex
│   ├── auth.ts         # Configuracao de autenticacao
│   ├── auth.config.ts  # Config do provider de auth
│   ├── http.ts         # HTTP routes (auth callback)
│   ├── schema.ts       # Schema do banco de dados
│   └── users.ts        # Queries de usuarios
└── package.json
```

## Schema

```typescript
// Tabela de usuarios (extende authTables)
users: defineTable({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  image: v.optional(v.string()),
  isAnonymous: v.optional(v.boolean()),
}).index("email", ["email"])
```

## Autenticacao

O package usa `@convex-dev/auth` com provider de Password:

- Registro com email/senha
- Login com email/senha
- Sessoes gerenciadas pelo Convex

## Desenvolvimento

```bash
# Da raiz do monorepo
pnpm convex:dev

# Ou diretamente
cd packages/convex
pnpm dev
```

## Deploy

```bash
# Da raiz do monorepo
pnpm convex:deploy

# Ou diretamente
cd packages/convex
pnpm deploy
```

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `CONVEX_DEPLOYMENT` | ID do deployment | Sim |
| `CONVEX_SITE_URL` | URL do site (para auth) | Sim |

## Queries e Mutations

### users.ts

| Funcao | Tipo | Descricao |
|--------|------|-----------|
| `getCurrentUser` | query | Retorna usuario autenticado |

## Scripts

| Script | Descricao |
|--------|-----------|
| `pnpm dev` | Inicia Convex dev |
| `pnpm deploy` | Deploy para producao |
