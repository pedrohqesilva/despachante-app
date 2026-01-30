# TODO - Despachante App

## Melhorias Pendentes

### Seguranca

#### Alta Prioridade

- [ ] **IDOR - Verificacao de Ownership**: Queries e mutations do Convex nao verificam se o usuario tem permissao para acessar o recurso. Qualquer usuario autenticado pode acessar dados de outros usuarios.
  - Arquivos: `packages/convex/convex/clients/queries.ts`, `properties/queries.ts`, `contracts/queries.ts`, `clientDocuments/queries.ts`, `propertyDocuments/queries.ts`
  - Correcao: Adicionar verificacao de `ownerId` ou `organizationId` em todas as queries/mutations

- [ ] **Sistema de Roles/Permissions**: Nao existe diferenciacao entre tipos de usuarios (admin, operador, visualizador).
  - Arquivo: `packages/convex/convex/schema.ts`
  - Correcao: Adicionar campo `role` na tabela `users` e criar middleware de autorizacao

- [ ] **Multi-tenancy**: Nenhuma tabela possui campo `organizationId` para isolamento de dados entre diferentes escritorios.
  - Arquivo: `packages/convex/convex/schema.ts`
  - Correcao: Adicionar `organizationId` em todas as tabelas e filtrar queries por organizacao

- [ ] **Acesso Irrestrito a Storage**: Funcoes `getUrl` permitem obter URL de qualquer arquivo passando apenas o `storageId`.
  - Arquivos: `clientDocuments/queries.ts`, `propertyDocuments/queries.ts`, `contracts/queries.ts`
  - Correcao: Verificar ownership do documento antes de retornar URL

- [ ] **Rate Limiting**: Nenhuma mutation implementa rate limiting, permitindo ataques de forca bruta e DoS.
  - Arquivos: Todas as mutations em `packages/convex/convex/`
  - Correcao: Implementar rate limiter no Convex

#### Media Prioridade

- [ ] **Audit Logging**: Nenhuma operacao e registrada em log de auditoria. Necessario para conformidade com LGPD.
  - Correcao: Criar tabela `auditLogs` e registrar acoes sensiveis (create, update, delete)

- [ ] **Validacao de URL de Imagem**: O RichTextEditor permite inserir imagens via URL sem validacao de protocolo ou dominio.
  - Arquivo: `apps/web/src/components/ui/rich-text-editor.tsx`
  - Correcao: Validar que URL usa HTTPS e pertence a dominios permitidos

- [ ] **Validacao Semantica nos Formularios**: Formularios validam apenas presenca de dados, nao formato (email, CPF/CNPJ).
  - Arquivos: `apps/web/src/features/clients/hooks/useClientForm.ts`, mutations do Convex
  - Correcao: Adicionar validacao de formato com regex ou zod

- [ ] **Mensagens de Erro Verbosas**: Middleware de erro pode expor informacoes tecnicas em producao.
  - Arquivo: `apps/server/src/index.ts`
  - Correcao: Retornar mensagens genericas em producao, detalhes apenas em desenvolvimento

- [ ] **Console.log em Producao**: Multiplos `console.log` e `console.error` podem vazar informacoes.
  - Correcao: Substituir por biblioteca de logging com niveis (pino, winston)

- [ ] **Validacao de Email Duplicado**: A mutation `updateProfile` permite alterar email sem verificar duplicidade.
  - Arquivo: `packages/convex/convex/users/mutations.ts`
  - Correcao: Verificar se email ja existe antes de atualizar

- [ ] **Restricoes de Upload**: `generateUploadUrl` gera URL sem restricoes de tipo de arquivo ou tamanho.
  - Arquivos: `clientDocuments/mutations.ts`, `propertyDocuments/mutations.ts`, `contracts/mutations.ts`
  - Correcao: Validar tipo MIME e tamanho apos upload
