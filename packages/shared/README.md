# @despachante/shared

Package de tipos e utilitários compartilhados para o monorepo Despachante App.

## Sobre

Este package contém tipos TypeScript e funções utilitárias usadas tanto pelo frontend (`@despachante/web`) quanto pelo backend (`@despachante/server`).

## Estrutura

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── history.ts       # Tipos do histórico
│   │   └── index.ts         # Re-exports
│   └── index.ts             # Entry point
├── dist/                    # Build output
├── tsconfig.json
└── package.json
```

## Tipos Disponíveis

### History Types

```typescript
// Status de um job
type HistoryStatus = 'processing' | 'completed' | 'error';

// Tipo de geração
type HistoryType = 'professional' | 'color_change' | 'with_model' | 'with_model_user';

// Metadados opcionais
interface HistoryMetadata {
  studio_id?: string;
  aspect_ratio?: string;
  model?: string;
  user_photo_filename?: string;
  user_photo_storage_id?: string;
  ring_type?: string;
  color?: string;
  main_stone?: string;
  secondary_stones?: string;
  paved_stones?: string;
}

// Entrada do histórico
interface HistoryEntry {
  id: string;
  type: HistoryType;
  status: HistoryStatus;
  created_at: string | number;
  completed_at: string | number | null;
  original_filename: string;
  original_storage_id?: string | null;
  generated_filename: string | null;
  generated_storage_id?: string | null;
  prompt: string;
  error?: string;
  metadata?: HistoryMetadata;
}

// Resposta da API de histórico
interface HistoryResponse {
  history: HistoryEntry[];
}

// Resposta de status
interface HistoryStatusResponse {
  jobs: Array<{
    id: string;
    status: HistoryStatus;
    progress: number;
    result?: {
      filename: string;
      prompt: string;
    };
    error?: string;
  }>;
}

// Input para criar entrada (usado pelo server)
interface HistoryEntryInput {
  type: HistoryType;
  original_filename: string;
  original_storage_id: string | null;
  prompt: string;
  metadata?: HistoryMetadata;
}

// Update de entrada (usado pelo server)
interface HistoryEntryUpdate {
  status?: HistoryStatus;
  generated_filename?: string | null;
  generated_storage_id?: string | null;
  error?: string;
  completed_at?: number | null;
}
```

## Uso

### Importando tipos

```typescript
// Importar todos os tipos
import type {
  HistoryStatus,
  HistoryType,
  HistoryEntry,
  HistoryResponse,
} from "@despachante/shared/types";

// Ou via index
import type { HistoryEntry } from "@despachante/shared";
```

### Exemplo no Frontend

```typescript
import type { HistoryEntry } from "@despachante/shared/types";

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  return (
    <div>
      <p>Status: {entry.status}</p>
      <p>Tipo: {entry.type}</p>
      {entry.error && <p>Erro: {entry.error}</p>}
    </div>
  );
}
```

### Exemplo no Backend

```typescript
import type { HistoryEntryInput, HistoryEntryUpdate } from "@despachante/shared/types";

async function createHistoryEntry(input: HistoryEntryInput) {
  // ...
}

async function updateHistoryEntry(id: string, update: HistoryEntryUpdate) {
  // ...
}
```

## Build

```bash
# Da raiz do monorepo (via Turborepo)
pnpm build

# Ou diretamente
cd packages/shared
pnpm build
```

## Exports

| Export | Descrição |
|--------|-----------|
| `@despachante/shared` | Entry point principal |
| `@despachante/shared/types` | Tipos do histórico |

## Scripts

| Script | Descrição |
|--------|-----------|
| `pnpm build` | Compila TypeScript para `dist/` |
| `pnpm dev` | Watch mode |
| `pnpm typecheck` | Verificação de tipos |
