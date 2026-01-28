# Feature: Contracts

Feature para gerenciamento de contratos vinculados a imoveis.

## Estrutura de Pastas

```
contracts/
├── components/
│   ├── CreateContractCard.tsx      # Card para iniciar criacao de contrato
│   ├── ContractDialog.tsx          # Dialog principal com 3 steps
│   ├── ContractFormFields.tsx      # Step 1: selecao de modelo/cliente/cartorio
│   ├── ContractPreview.tsx         # Step 2: preview do contrato gerado
│   ├── ContractEditor.tsx          # Step 3: editor TipTap para ajustes finais
│   ├── ContractDocumentRow.tsx     # Row de contrato na lista de documentos
│   └── ContractsList.tsx           # Lista de contratos por cliente
├── hooks/
│   ├── useContractForm.ts          # Hook de formulario de contrato
│   └── useContractGeneration.ts    # Hook para geracao de contrato
├── utils/
│   └── placeholder-replacer.ts     # Utilitario de substituicao de placeholders
├── index.ts                        # Barrel export
└── README.md                       # Esta documentacao
```

## Componentes

### CreateContractCard

Card visual para iniciar a criacao de um novo contrato.

**Props:**
```typescript
interface CreateContractCardProps {
  onClick: () => void       // Callback ao clicar
  disabled?: boolean        // Desabilita o card
  className?: string        // Classes CSS adicionais
}
```

**Uso:**
```tsx
<CreateContractCard onClick={() => setDialogOpen(true)} />
```

### ContractDialog

Dialog principal com fluxo de 3 steps para criacao de contratos.

**Props:**
```typescript
interface ContractDialogProps {
  propertyId: Id<"properties">   // ID do imovel
  ownerIds: Id<"clients">[]      // IDs dos proprietarios
  open: boolean                  // Estado de abertura
  onOpenChange: (open: boolean) => void  // Callback de mudanca
}
```

**Steps:**
1. **select** - Selecao de modelo, cliente e cartorio
2. **preview** - Visualizacao do contrato gerado
3. **edit** - Edicao final do texto

**Uso:**
```tsx
<ContractDialog
  propertyId={property._id}
  ownerIds={property.ownerIds}
  open={dialogOpen}
  onOpenChange={setDialogOpen}
/>
```

### ContractFormFields

Campos do formulario para selecao de dados do contrato (Step 1).

**Props:**
```typescript
interface ContractFormFieldsProps {
  formData: ContractFormData
  errors: ContractFormErrors
  ownerIds: Id<"clients">[]
  onFieldChange: <K extends keyof ContractFormData>(field: K, value: ContractFormData[K]) => void
  disabled?: boolean
}
```

### ContractPreview

Componente de preview do contrato renderizado (Step 2).

**Props:**
```typescript
interface ContractPreviewProps {
  content: string       // Conteudo HTML do contrato
  className?: string
}
```

### ContractEditor

Editor TipTap para edicao final do contrato (Step 3).

**Props:**
```typescript
interface ContractEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  className?: string
}
```

### ContractDocumentRow

Row de contrato para exibir na lista de documentos do imovel.

**Props:**
```typescript
interface ContractDocumentRowProps {
  contract: Contract
  onView?: (contract: Contract) => void
  onEdit?: (contract: Contract) => void
}
```

**Funcionalidades:**
- Exibe nome, status e data de criacao
- Acoes: Visualizar, Editar (se rascunho), Exportar PDF, Excluir

### ContractsList

Lista de contratos de um cliente especifico.

**Props:**
```typescript
interface ContractsListProps {
  clientId: Id<"clients">
  onContractClick?: (contract: ContractWithRelations) => void
  className?: string
}
```

## Hooks

### useContractForm

Hook para gerenciamento do formulario de contrato.

**Retorno:**
```typescript
interface UseContractFormReturn {
  formData: ContractFormData
  errors: ContractFormErrors
  setFormData: React.Dispatch<React.SetStateAction<ContractFormData>>
  updateField: <K extends keyof ContractFormData>(field: K, value: ContractFormData[K]) => void
  validate: () => boolean
  reset: () => void
  isValid: boolean
}
```

**Uso:**
```tsx
const { formData, errors, updateField, validate, isValid } = useContractForm()
```

### useContractGeneration

Hook para geracao de contrato com substituicao de placeholders.

**Opcoes:**
```typescript
interface UseContractGenerationOptions {
  templateId: Id<"contractTemplates"> | null
  clientId: Id<"clients"> | null
  propertyId: Id<"properties">
  notaryOfficeId: Id<"notaryOffices"> | null
}
```

**Retorno:**
```typescript
interface UseContractGenerationReturn {
  generatedContent: string     // Conteudo gerado
  isLoading: boolean           // Estado de carregamento
  error: string | null         // Mensagem de erro
  generate: () => void         // Funcao para gerar
  templateName: string | null  // Nome do template selecionado
  isReady: boolean             // Dados prontos para geracao
}
```

**Uso:**
```tsx
const { generatedContent, generate, isReady } = useContractGeneration({
  templateId: formData.templateId,
  clientId: formData.clientId,
  propertyId,
  notaryOfficeId: formData.notaryOfficeId,
})
```

## Utils

### replacePlaceholders

Funcao para substituir placeholders no template.

**Assinatura:**
```typescript
function replacePlaceholders(template: string, data: ReplacementData): string
```

**ReplacementData:**
```typescript
interface ReplacementData {
  client: Client
  property: Property
  notaryOffice?: NotaryOffice | null
}
```

**Placeholders Suportados:**

| Placeholder | Descricao | Exemplo |
|-------------|-----------|---------|
| `{{client.name}}` | Nome do cliente | Joao da Silva |
| `{{client.cpf}}` | CPF formatado | 123.456.789-00 |
| `{{client.email}}` | Email | joao@email.com |
| `{{client.phone}}` | Telefone formatado | (31) 99999-9999 |
| `{{client.maritalStatus}}` | Estado civil | Casado |
| `{{client.fatherName}}` | Nome do pai | Jose da Silva |
| `{{client.motherName}}` | Nome da mae | Maria da Silva |
| `{{property.address}}` | Endereco completo | Rua das Palmeiras, 456, Apto 101 |
| `{{property.street}}` | Logradouro | Rua das Palmeiras |
| `{{property.number}}` | Numero | 456 |
| `{{property.complement}}` | Complemento | Apto 101 |
| `{{property.neighborhood}}` | Bairro | Centro |
| `{{property.city}}` | Cidade | Belo Horizonte |
| `{{property.state}}` | Estado | MG |
| `{{property.zipCode}}` | CEP formatado | 30000-000 |
| `{{property.area}}` | Area formatada | 120,50 m2 |
| `{{property.value}}` | Valor formatado | R$ 350.000,00 |
| `{{property.type}}` | Tipo do imovel | Apartamento |
| `{{notaryOffice.name}}` | Nome do cartorio | 1o Oficio de Notas |
| `{{notaryOffice.code}}` | Codigo | 1o OFICIO |
| `{{notaryOffice.address}}` | Endereco | Av. Brasil, 1000 |
| `{{notaryOffice.city}}` | Cidade | Belo Horizonte |
| `{{date.current}}` | Data atual | 28/01/2026 |
| `{{date.currentExtended}}` | Data por extenso | 28 de janeiro de 2026 |

## Tipos Exportados

```typescript
// Formulario
export type { ContractFormData, ContractFormErrors, UseContractFormReturn }

// Geracao
export type { UseContractGenerationOptions, UseContractGenerationReturn }

// Utils
export type { ReplacementData }
```

## Integracao com Backend

### Queries utilizadas
- `contractTemplatesApi.queries.getActive` - Templates ativos
- `contractTemplatesApi.queries.getById` - Template por ID
- `clientsApi.queries.listByIds` - Clientes por IDs
- `clientsApi.queries.getById` - Cliente por ID
- `propertiesApi.queries.getById` - Imovel por ID
- `notaryOfficesApi.queries.list` - Lista de cartorios
- `notaryOfficesApi.queries.getById` - Cartorio por ID
- `contractsApi.queries.getPdfUrl` - URL do PDF
- `contractsApi.queries.listByClient` - Contratos por cliente

### Mutations utilizadas
- `contractsApi.mutations.create` - Criar contrato
- `contractsApi.mutations.remove` - Remover contrato

## Exemplo de Integracao na DocumentsSection

```tsx
import { useState } from "react"
import { useQuery } from "convex/react"
import { CreateContractCard, ContractDialog, ContractDocumentRow } from "@/features/contracts"
import { contractsApi } from "@/lib/api"

function DocumentsSection({ propertyId, ownerIds }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const contracts = useQuery(contractsApi.queries.listByProperty, { propertyId })

  return (
    <div>
      <CreateContractCard onClick={() => setDialogOpen(true)} />

      {contracts?.map((contract) => (
        <ContractDocumentRow
          key={contract._id}
          contract={contract}
          onView={(c) => console.log("View", c)}
        />
      ))}

      <ContractDialog
        propertyId={propertyId}
        ownerIds={ownerIds}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
```

## Fluxo de Criacao de Contrato

```
1. Usuario clica em CreateContractCard
   └── Dialog abre no Step "select"

2. Step "select": Seleciona modelo, cliente e cartorio
   └── Clica "Gerar Contrato"
   └── Sistema busca dados e substitui placeholders

3. Step "preview": Visualiza contrato gerado
   └── Pode salvar como rascunho
   └── Ou clicar "Editar" para ajustes

4. Step "edit": Edita texto final no TipTap
   └── Salvar como rascunho (status: "draft")
   └── Ou finalizar (status: "final")
```

## Status do Contrato

| Status | Label | Descricao |
|--------|-------|-----------|
| `draft` | Rascunho | Contrato em edicao |
| `final` | Finalizado | Contrato pronto |
| `signed` | Assinado | Contrato assinado |

## Dependencias

- `@tiptap/react` - Editor de texto rico
- `@tiptap/starter-kit` - Extensoes basicas do TipTap
- `@tiptap/extension-placeholder` - Placeholder para editor vazio
- `sonner` - Notificacoes toast
