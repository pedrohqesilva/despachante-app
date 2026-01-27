# @despachante/web

Frontend React da aplicação Despachante App.

## Stack

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 19.0 | Biblioteca UI |
| TypeScript | 5.7 | Tipagem estática |
| Vite | 6.2 | Build tool |
| Tailwind CSS | 4.0 | Framework CSS |
| shadcn/ui | latest | Componentes UI |
| React Router | 7.3 | Roteamento |
| Convex | 1.31 | Backend/Database |

## Estrutura

```
apps/web/
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/             # shadcn/ui components
│   │   ├── auth/           # Componentes de autenticação
│   │   └── icons/          # Ícones customizados
│   ├── contexts/           # React Contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários
│   ├── pages/              # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── ColorChange.tsx
│   │   ├── ProfessionalPhoto.tsx
│   │   ├── TryOn.tsx
│   │   └── WithModel.tsx
│   ├── services/           # Serviços de API
│   ├── types/              # Definições de tipos
│   ├── config/             # Configurações
│   ├── App.tsx
│   ├── Router.tsx
│   ├── main.tsx
│   └── index.css
├── public/                 # Assets estáticos
├── convex/                 # Re-exports do @despachante/convex
├── index.html
├── vite.config.ts
├── tsconfig.json
├── Dockerfile
├── nginx.conf
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

A aplicação estará disponível em `http://localhost:5173`

## Build

```bash
# Da raiz do monorepo
pnpm build:web

# Ou diretamente
cd apps/web
pnpm build
```

Os arquivos de produção serão gerados em `dist/`.

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do monorepo:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_APP_NAME` | Nome da aplicação | `Despachante App` |
| `VITE_BASE_URL` | Base URL | `/` |
| `VITE_API_BASE_URL` | URL da API backend | `http://localhost:5000` |
| `CONVEX_URL` | URL do Convex | `https://xxx.convex.cloud` |
| `CONVEX_SITE_URL` | URL do site (para auth) | `http://localhost:5173` |

## Páginas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Dashboard | Histórico de gerações |
| `/color-change` | Transformar Cores | Alterar cores de ouro e pedras |
| `/professional` | Foto Profissional | Gerar foto de estúdio |
| `/with-model` | Joia em Modelo | Visualizar em modelo |
| `/try-on` | Try-On | Experimentar com foto do usuário |

## Docker

```bash
# Build da imagem
docker build -t despachante-web \
  --build-arg VITE_API_BASE_URL=https://api.exemplo.com \
  --build-arg CONVEX_URL=https://xxx.convex.cloud \
  .

# Executar
docker run -p 80:80 despachante-web
```

## Dependências de Workspace

- `@despachante/convex` - Queries e mutations do Convex
- `@despachante/shared` - Tipos compartilhados

## Scripts

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm preview` | Preview do build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Verificação de tipos |
