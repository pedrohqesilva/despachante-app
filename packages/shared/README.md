# @despachante/shared

Tipos TypeScript compartilhados para o monorepo Despachante App.

## Estrutura

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── history.ts  # Tipos do historico
│   │   └── index.ts    # Re-exports
│   └── index.ts        # Entry point
├── dist/               # Build output
└── package.json
```

## Uso

```typescript
// Importar tipos
import type { HistoryEntry, HistoryStatus } from "@despachante/shared/types";

// Ou via index
import type { HistoryEntry } from "@despachante/shared";
```

## Tipos Disponiveis

### HistoryStatus

```typescript
type HistoryStatus = 'processing' | 'completed' | 'error';
```

### HistoryType

```typescript
type HistoryType = 'professional' | 'color_change' | 'with_model' | 'with_model_user';
```

### HistoryEntry

```typescript
interface HistoryEntry {
  id: string;
  type: HistoryType;
  status: HistoryStatus;
  created_at: string | number;
  completed_at: string | number | null;
  original_filename: string;
  generated_filename: string | null;
  prompt: string;
  error?: string;
  metadata?: HistoryMetadata;
}
```

## Build

```bash
# Da raiz do monorepo
pnpm build

# Ou diretamente
cd packages/shared
pnpm build
```

## Scripts

| Script | Descricao |
|--------|-----------|
| `pnpm build` | Compila TypeScript |
| `pnpm dev` | Watch mode |
| `pnpm typecheck` | Verificacao de tipos |
