# Feature: Clients

Módulo responsável pela gestão de clientes (pessoas físicas e jurídicas) do sistema, incluindo funcionalidades de cadastro, edição, listagem e vinculação de cônjuges.

## Estrutura

```
clients/
├── components/
│   ├── ClientDialog.tsx         # Dialog de criação/edição de cliente
│   ├── ClientFormFields.tsx     # Campos do formulário (dados pessoais, filiação, contato)
│   ├── ClientsTableActions.tsx  # Menu de ações da tabela (editar, excluir)
│   ├── CreateSpouseDialog.tsx   # Dialog para criar novo cônjuge
│   ├── DocumentsSection.tsx     # Seção de documentos na página de detalhes
│   ├── ExportButton.tsx         # Botão de exportação CSV/Excel
│   ├── MaritalStatusSelector.tsx # Seletor de estado civil e regime de bens
│   ├── OverviewSection.tsx      # Seção de visão geral na página de detalhes
│   ├── PropertiesSection.tsx    # Seção de imóveis vinculados
│   └── SpouseSelector.tsx       # Seletor de cônjuge existente/novo
├── hooks/
│   ├── useClientForm.ts         # Hook de gerenciamento do formulário de cliente
│   └── useSpouseForm.ts         # Hook de gerenciamento do formulário de cônjuge
├── index.ts                      # Barrel export
└── README.md                     # Esta documentação
```

## Componentes

### ClientDialog

Dialog principal para criação e edição de clientes.

**Props:**
```typescript
interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null           // Cliente para edição (null = criação)
  onSave: (data: ClientDialogSaveData) => Promise<void>
}
```

**Características:**
- Modo criação e edição
- Validação de campos obrigatórios
- Integração com seletor de cônjuge
- Suporte a criação de cônjuge inline

### ClientFormFields

Campos reutilizáveis do formulário de cliente.

**Seções:**
1. **Dados Pessoais** - Nome, CPF/CNPJ
2. **Filiação** - Nome da mãe, Nome do pai
3. **Contato** - Email, Telefone

**Props:**
```typescript
interface ClientFormFieldsProps {
  formData: ClientFormData
  errors: ClientFormErrors
  onFieldChange: (field, value) => void
  onPhoneChange: (value: string) => void    // Formatação automática
  onTaxIdChange: (value: string) => void    // Formatação CPF/CNPJ
  idPrefix?: string                          // Prefixo para IDs únicos
}
```

### MaritalStatusSelector

Seletor de estado civil com campos condicionais.

**Estados Civis:**
- Solteiro(a)
- Casado(a) → Exibe regime de bens e data de casamento
- Divorciado(a)
- Viúvo(a)
- União Estável → Exibe regime de bens

**Regimes de Bens:**
- Comunhão Parcial de Bens
- Comunhão Universal de Bens
- Separação Total de Bens
- Participação Final nos Aquestos

### SpouseSelector

Componente para seleção ou criação de cônjuge.

**Funcionalidades:**
- Busca de clientes existentes
- Seleção de cônjuge da lista
- Criação de novo cônjuge inline
- Exibição de cônjuge pendente (não salvo)

## Hooks

### useClientForm

Hook que encapsula toda a lógica do formulário de cliente.

**Retorno:**
```typescript
{
  formData: ClientFormData           // Dados do formulário
  errors: ClientFormErrors           // Erros de validação
  updateField: (field, value) => void
  handlePhoneChange: (value) => void // Com formatação
  handleTaxIdChange: (value) => void // Com formatação CPF/CNPJ
  handleMaritalStatusChange: (value) => void
  validate: (hasSpouseData?) => boolean
  getSubmitData: () => ClientSubmitData
  reset: (client?) => void
  setErrors: (errors) => void
}
```

**Validações:**
- Nome obrigatório
- CPF/CNPJ obrigatório e válido
- Email obrigatório e válido
- Telefone obrigatório
- Estado civil obrigatório
- Regime de bens obrigatório (quando casado/união estável)
- Cônjuge obrigatório (quando casado/união estável)

### useSpouseForm

Hook simplificado para dados do cônjuge a ser criado.

**Retorno:**
```typescript
{
  formData: SpouseFormData
  updateField: (field, value) => void
  reset: () => void
  hasData: () => boolean    // Verifica se há dados preenchidos
}
```

## Tipos

```typescript
// Dados do formulário
interface ClientFormData {
  name: string
  taxId: string
  email: string
  phone: string
  motherName: string
  fatherName: string
  maritalStatus: MaritalStatus | ""
  propertyRegime: PropertyRegime | ""
  weddingDate: string
  spouseId: Id<"clients"> | null
  status: ClientStatus
}

// Erros de validação
interface ClientFormErrors {
  name?: boolean
  taxId?: boolean
  email?: boolean
  phone?: boolean
  maritalStatus?: boolean
  propertyRegime?: boolean
  spouseId?: boolean
}

// Dados para submissão
interface ClientSubmitData {
  name: string
  taxId: string
  email: string
  phone: string
  motherName?: string
  fatherName?: string
  maritalStatus: MaritalStatus
  propertyRegime?: PropertyRegime
  weddingDate?: string
  spouseId?: Id<"clients">
  status?: ClientStatus
}

// Dados do cônjuge
interface SpouseFormData {
  name: string
  taxId: string
  email: string
  phone: string
  motherName: string
  fatherName: string
}
```

## Uso

### Listagem de Clientes

```tsx
import { ClientDialog, ClientsTableActions, ExportButton } from "@/features/clients"

function ClientsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  return (
    <>
      <ExportButton clients={clients} />

      <ClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={editingClient}
        onSave={handleSave}
      />

      {clients.map(client => (
        <ClientsTableActions
          client={client}
          onEdit={() => {
            setEditingClient(client)
            setIsDialogOpen(true)
          }}
          onDelete={handleDelete}
        />
      ))}
    </>
  )
}
```

### Página de Detalhes

```tsx
import { OverviewSection, PropertiesSection, DocumentsSection } from "@/features/clients"

function ClientDetailsPage() {
  return (
    <div>
      <OverviewSection client={client} spouse={spouse} />
      <PropertiesSection properties={properties} />
      <DocumentsSection documents={documents} />
    </div>
  )
}
```

## Integração com Backend

### Queries (Convex)

| Query | Descrição |
|-------|-----------|
| `clients.list` | Lista paginada com filtros e ordenação |
| `clients.get` | Busca cliente por ID |
| `clients.searchExcluding` | Busca para seletor de cônjuge |
| `clients.checkDuplicates` | Verifica duplicatas antes de criar |

### Mutations (Convex)

| Mutation | Descrição |
|----------|-----------|
| `clients.create` | Cria novo cliente |
| `clients.update` | Atualiza cliente existente |
| `clients.deleteClient` | Remove cliente |

## Constantes Relacionadas

Arquivo: `lib/constants/client.constants.ts`

```typescript
// Opções de estado civil
MARITAL_STATUS_OPTIONS

// Opções de regime de bens
PROPERTY_REGIME_OPTIONS

// Funções utilitárias
getClientStatusLabel(status)
getClientStatusBadgeVariant(status)
getClientStatusBadgeClassName(status)
getMaritalStatusLabel(status)
getPropertyRegimeLabel(regime)
requiresSpouse(maritalStatus)  // Verifica se precisa de cônjuge
```

## Formatadores

Arquivo: `lib/format.ts`

```typescript
formatTaxId(value)     // Formata CPF/CNPJ
formatPhone(value)     // Formata telefone
```
