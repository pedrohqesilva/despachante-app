# Despachante App

Sistema de gestão para despachantes imobiliários, permitindo o gerenciamento de clientes, imóveis, cartórios e documentos.

## Stack Tecnológica

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| pnpm | 9+ | Package manager |
| Turborepo | 2.3+ | Build system para monorepo |
| Node.js | 20+ | Runtime |
| TypeScript | 5.7 | Tipagem estática |
| React | 19 | Framework UI |
| Vite | 6 | Bundler e dev server |
| Tailwind CSS | 4 | Framework de estilos |
| shadcn/ui | latest | Componentes base |
| Convex | 1.31+ | Backend serverless |
| Clerk | latest | Autenticação |

## Estrutura do Monorepo

```
despachante-app/
├── apps/
│   ├── web/                    # Frontend React + Vite
│   └── server/                 # Backend Express (auxiliar)
├── packages/
│   ├── convex/                 # Backend Convex (principal)
│   └── shared/                 # Tipos compartilhados
├── .claude/                    # Configurações Claude Code
├── .cursor/                    # Configurações Cursor
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Arquitetura

### Frontend (`apps/web`)

O frontend segue a arquitetura **Feature-Sliced Design (FSD)** adaptada:

```
apps/web/src/
├── components/                 # Componentes compartilhados
│   ├── ui/                    # Componentes base (shadcn/ui + customizados)
│   ├── auth/                  # Componentes de autenticação
│   └── icons/                 # Ícones customizados
├── features/                   # Módulos de domínio
│   ├── clients/               # Feature de clientes
│   ├── properties/            # Feature de imóveis
│   ├── notary-offices/        # Feature de cartórios
│   └── settings/              # Feature de configurações
├── pages/                      # Páginas da aplicação
├── hooks/                      # Hooks globais
├── lib/                        # Utilitários e constantes
│   ├── constants/             # Constantes por domínio
│   ├── api.ts                 # Configuração de APIs
│   ├── format.ts              # Formatadores
│   └── utils.ts               # Utilitários gerais
├── types/                      # Tipos TypeScript globais
├── contexts/                   # Contextos React
└── services/                   # Serviços externos
```

#### Estrutura de uma Feature

Cada feature segue uma estrutura consistente:

```
features/{feature-name}/
├── components/                 # Componentes da feature
│   ├── {Feature}Dialog.tsx    # Dialog de criação/edição
│   ├── {Feature}FormFields.tsx # Campos do formulário
│   └── {Feature}TableActions.tsx # Ações da tabela
├── hooks/                      # Hooks da feature
│   └── use{Feature}Form.ts    # Hook de formulário
└── index.ts                    # Barrel export
```

#### Componentes UI Reutilizáveis

Componentes em `components/ui/`:

| Componente | Descrição |
|------------|-----------|
| `EmptyState` | Estado vazio para tabelas |
| `SearchInput` | Input de busca com botão clear |
| `TablePagination` | Paginação de tabelas |
| `SortableTableHead` | Cabeçalho com ordenação |
| `TableSkeleton` | Loading skeleton |
| `DialogHeaderWithIcon` | Header de dialog com ícone |
| `FormSection` | Seção de formulário |
| `StatusBadge` | Badge de status semântico |

### Backend (`packages/convex`)

O backend utiliza **Convex** como plataforma serverless:

```
packages/convex/convex/
├── _generated/                 # Código gerado pelo Convex
├── lib/                        # Utilitários compartilhados
├── clients/                    # Módulo de clientes
│   ├── queries.ts             # Queries (leitura)
│   └── mutations.ts           # Mutations (escrita)
├── properties/                 # Módulo de imóveis
├── notaryOffices/              # Módulo de cartórios
├── clientDocuments/            # Documentos de clientes
├── propertyDocuments/          # Documentos de imóveis
├── users/                      # Módulo de usuários
└── schema.ts                   # Schema do banco de dados
```

---

## Convenções de Código

### Linguagem

| Contexto | Idioma |
|----------|--------|
| Código (variáveis, funções, tipos) | Inglês |
| UI (labels, mensagens) | Português (pt-BR) |
| Comentários | Português (quando necessário) |
| Commits | Português |

### Princípios

- **SOLID** - Especialmente Single Responsibility
- **DRY** - Evitar duplicação com componentes reutilizáveis
- **KISS** - Manter soluções simples
- **Composition over Inheritance** - Preferir composição

---

## Requisitos

- Node.js >= 20.0.0
- pnpm >= 9.0.0

## Instalação

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

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia todos os apps em modo desenvolvimento |
| `pnpm dev:web` | Inicia apenas o frontend |
| `pnpm dev:server` | Inicia apenas o backend |
| `pnpm build` | Build de produção |
| `pnpm lint` | Executa linting |
| `pnpm typecheck` | Verificação de tipos |
| `pnpm clean` | Limpa builds e node_modules |
| `pnpm convex:dev` | Inicia Convex em desenvolvimento |
| `pnpm convex:deploy` | Deploy do Convex |

---

## Features

| Feature | Descrição | Documentação |
|---------|-----------|--------------|
| **Clients** | Gestão de clientes e cônjuges | [README](apps/web/src/features/clients/README.md) |
| **Properties** | Gestão de imóveis | [README](apps/web/src/features/properties/README.md) |
| **Notary Offices** | Gestão de cartórios | [README](apps/web/src/features/notary-offices/README.md) |

---

## Packages

| Package | Descrição |
|---------|-----------|
| `@despachante/web` | Frontend React com Vite |
| `@despachante/server` | Backend Express (auxiliar) |
| `@despachante/convex` | Funções e schema Convex |
| `@despachante/shared` | Tipos TypeScript compartilhados |

---

## Arquivos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `.claude/CLAUDE.md` | Instruções para Claude Code |
| `.cursor/rules/design.mdc` | Design system |
| `apps/web/src/pages/StyleGuide.tsx` | Guia visual de estilos |

---

## Licença

Projeto privado - Todos os direitos reservados.
