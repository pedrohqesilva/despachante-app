# @despachante/server

Backend Express da aplicação Despachante App.

## Stack

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Node.js | 20+ | Runtime |
| Express | 4.18 | Framework web |
| TypeScript | 5.7 | Tipagem estática |
| Multer | 1.4.5 | Upload de arquivos |
| Convex | 1.31 | Backend/Database |

## Estrutura

```
apps/server/
├── src/
│   ├── config/
│   │   └── index.ts         # Configurações do servidor
│   ├── routes/
│   │   └── api.ts           # Endpoints da API
│   ├── services/
│   │   ├── ConvexService.ts # Integração com Convex
│   │   ├── FileService.ts   # Gerenciamento de arquivos
│   │   ├── HistoryService.ts# Histórico de gerações
│   │   ├── ImageService.ts  # Processamento de imagens
│   │   └── kive-client.ts   # Cliente Kive.ai (GraphQL)
│   ├── utils/
│   │   └── file-polyfill.ts # Polyfill para File API
│   └── index.ts             # Entry point
├── temp/                    # Arquivos temporários
├── assets/
│   └── uploads/             # Imagens geradas
├── Dockerfile
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

O servidor estará disponível em `http://localhost:5000`

## Build

```bash
# Da raiz do monorepo
pnpm build:server

# Ou diretamente
cd apps/server
pnpm build
pnpm start
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do monorepo ou em `apps/server/`:

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `PORT` | Porta do servidor | Não (default: 5000) |
| `CONVEX_URL` | URL do Convex | Sim |
| `SERVER_API_KEY` | Chave de API do Convex | Sim |
| `KIVE_EMAIL` | Email da conta Kive.ai | Sim |
| `KIVE_PASSWORD` | Senha da conta Kive.ai | Sim |
| `TEMP_FOLDER` | Pasta temporária | Não (default: ./temp) |
| `UPLOAD_FOLDER` | Pasta de uploads | Não (default: ./assets/uploads) |

## API Reference

### Endpoints

#### Histórico

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/history` | Lista histórico de gerações |
| `GET` | `/api/history-status` | Status dos jobs em processamento |
| `GET` | `/api/status/:job_id` | Status de um job específico |
| `DELETE` | `/api/delete-history/:job_id` | Remove entrada do histórico |

#### Geração de Imagens

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/generate-color-change` | Mudança de cor de joia |
| `POST` | `/api/generate-professional` | Foto profissional de estúdio |
| `POST` | `/api/generate-with-model` | Joia em modelo profissional |
| `POST` | `/api/generate-with-model-user` | Try-on com foto do usuário |

#### Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Verifica se o servidor está online |

### Exemplos

**Listar histórico:**

```bash
curl http://localhost:5000/api/history
```

**Verificar status de job:**

```bash
curl http://localhost:5000/api/status/abc123
```

**Gerar mudança de cor:**

```bash
curl -X POST http://localhost:5000/api/generate-color-change \
  -H "Content-Type: application/json" \
  -d '{
    "storage_id": "k57abc123...",
    "history_id": "j57def456...",
    "ring_type": "solitario",
    "color": "rose",
    "main_stone": "diamante"
  }'
```

### Status dos Jobs

| Status | Descrição |
|--------|-----------|
| `processing` | Job em andamento |
| `completed` | Geração concluída |
| `error` | Falha na geração |

## Docker

```bash
# Build da imagem
docker build -t despachante-server .

# Executar
docker run -p 5000:5000 \
  -e CONVEX_URL=https://xxx.convex.cloud \
  -e SERVER_API_KEY=sua-chave \
  -e KIVE_EMAIL=email@exemplo.com \
  -e KIVE_PASSWORD=sua-senha \
  despachante-server
```

## Dependências de Workspace

- `@despachante/convex` - Queries e mutations do Convex
- `@despachante/shared` - Tipos compartilhados

## Scripts

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Servidor com hot-reload |
| `pnpm build` | Compila TypeScript |
| `pnpm start` | Executa build de produção |
| `pnpm typecheck` | Verificação de tipos |

## Fluxo de Geração

```
1. Frontend envia requisição POST com storage_id e parâmetros
2. Server baixa imagem do Convex Storage
3. Server salva temporariamente e inicia job assíncrono
4. Server faz login no Kive.ai
5. Server cria modelo customizado no Kive
6. Server gera imagem com o prompt
7. Server baixa imagem gerada e faz upload para Convex
8. Server atualiza histórico no Convex
9. Frontend recebe status via polling
```
