# Feature: Notary Offices

Módulo responsável pela gestão de cartórios do sistema, incluindo funcionalidades de cadastro, edição e listagem.

## Estrutura

```
notary-offices/
├── components/
│   ├── NotaryOfficeDialog.tsx       # Dialog de criação/edição de cartório
│   ├── NotaryOfficeFormFields.tsx   # Campos do formulário
│   └── NotaryOfficesTableActions.tsx # Menu de ações da tabela
├── hooks/
│   └── useNotaryOfficeForm.ts       # Hook de gerenciamento do formulário
├── index.ts                          # Barrel export
└── README.md                         # Esta documentação
```

## Componentes

### NotaryOfficeDialog

Dialog principal para criação e edição de cartórios.

**Props:**
```typescript
interface NotaryOfficeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notaryOffice?: NotaryOffice | null  // Cartório para edição (null = criação)
  onSave: (data: NotaryOfficeDialogSaveData) => Promise<void>
}
```

**Características:**
- Modo criação e edição
- Busca automática de CEP via ViaCEP
- Validação de campos obrigatórios
- Campo de status apenas em modo edição

### NotaryOfficeFormFields

Campos reutilizáveis do formulário de cartório.

**Seções:**
1. **Identificação** - Código, Nome, Status (apenas edição)
2. **Contato** - Telefone, Email
3. **Localização** - CEP, Logradouro, Número, Complemento, Bairro, Cidade, UF

**Props:**
```typescript
interface NotaryOfficeFormFieldsProps {
  formData: NotaryOfficeFormData
  errors: NotaryOfficeFormErrors
  onFieldChange: (field, value) => void
  onZipCodeChange: (value: string) => void   // Com busca de CEP
  onPhoneChange: (value: string) => void     // Formatação automática
  onStateChange: (value: string) => void     // Uppercase automático
  isLoadingCep?: boolean
  isEditing?: boolean                         // Controla exibição do status
  numberInputRef?: RefObject<HTMLInputElement>
  disabled?: boolean
}
```

### NotaryOfficesTableActions

Menu de ações para cada linha da tabela.

**Props:**
```typescript
interface NotaryOfficesTableActionsProps {
  notaryOffice: NotaryOffice
  onEdit: (notaryOffice: NotaryOffice) => void
  onDelete: (notaryOffice: NotaryOffice) => Promise<void>
}
```

**Ações:**
- Editar cartório
- Excluir cartório (com confirmação)

## Hooks

### useNotaryOfficeForm

Hook que encapsula toda a lógica do formulário de cartório.

**Retorno:**
```typescript
{
  formData: NotaryOfficeFormData
  errors: NotaryOfficeFormErrors
  updateField: (field, value) => void
  handleZipCodeChange: (value) => void  // Com formatação
  handlePhoneChange: (value) => void    // Com formatação
  handleStateChange: (value) => void    // Uppercase
  setAddressFromCep: (address) => void  // Preenche campos do CEP
  validate: () => boolean
  getSubmitData: () => NotaryOfficeSubmitData
  reset: (notaryOffice?) => void
}
```

**Validações:**
- Código obrigatório
- Nome obrigatório
- Telefone obrigatório
- CEP obrigatório (8 dígitos)
- Logradouro obrigatório
- Número obrigatório
- Bairro obrigatório
- Cidade obrigatória
- UF obrigatória (2 caracteres)

## Tipos

```typescript
// Dados do formulário
interface NotaryOfficeFormData {
  name: string
  code: string
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  phone: string
  email: string
  status: NotaryOfficeStatus
}

// Erros de validação
interface NotaryOfficeFormErrors {
  name?: boolean
  code?: boolean
  phone?: boolean
  zipCode?: boolean
  street?: boolean
  number?: boolean
  neighborhood?: boolean
  city?: boolean
  state?: boolean
}

// Dados para submissão
interface NotaryOfficeSubmitData {
  name: string
  code: string
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  phone: string
  email?: string
  status: NotaryOfficeStatus
}

// Status do cartório
type NotaryOfficeStatus = "active" | "inactive"
```

## Uso

### Listagem de Cartórios

```tsx
import {
  NotaryOfficeDialog,
  NotaryOfficesTableActions
} from "@/features/notary-offices"

function NotaryOfficesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNotaryOffice, setEditingNotaryOffice] = useState<NotaryOffice | null>(null)

  const handleEdit = (notaryOffice: NotaryOffice) => {
    setEditingNotaryOffice(notaryOffice)
    setIsDialogOpen(true)
  }

  const handleOpenNew = () => {
    setEditingNotaryOffice(null)
    setIsDialogOpen(true)
  }

  return (
    <>
      <Button onClick={handleOpenNew}>
        Novo Cartório
      </Button>

      <NotaryOfficeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        notaryOffice={editingNotaryOffice}
        onSave={handleSave}
      />

      <Table>
        {notaryOffices.map(notaryOffice => (
          <TableRow key={notaryOffice._id}>
            <TableCell>{notaryOffice.code}</TableCell>
            <TableCell>{notaryOffice.name}</TableCell>
            <TableCell>
              <NotaryOfficesTableActions
                notaryOffice={notaryOffice}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </>
  )
}
```

## Integração com Backend

### Queries (Convex)

| Query | Descrição |
|-------|-----------|
| `notaryOffices.list` | Lista paginada com filtros e ordenação |
| `notaryOffices.get` | Busca cartório por ID |

### Mutations (Convex)

| Mutation | Descrição |
|----------|-----------|
| `notaryOffices.create` | Cria novo cartório |
| `notaryOffices.update` | Atualiza cartório existente |
| `notaryOffices.remove` | Remove cartório |

## Constantes Relacionadas

Arquivo: `lib/constants/notary-office.constants.ts`

```typescript
// Opções de status
NOTARY_OFFICE_STATUS_OPTIONS

// Funções utilitárias
getNotaryOfficeStatusLabel(status)
getNotaryOfficeStatusBadgeVariant(status)
getNotaryOfficeStatusBadgeClassName(status)
```

## Formatadores

Arquivo: `lib/format.ts`

```typescript
formatZipCode(value)   // Formata CEP (00000-000)
formatPhone(value)     // Formata telefone ((00) 00000-0000)
```

## Integração ViaCEP

O componente faz busca automática de endereço ao preencher o CEP:

```typescript
const fetchAddressByCep = async (cep: string) => {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  const data = await response.json()

  // Preenche automaticamente:
  // - Logradouro
  // - Bairro
  // - Cidade
  // - UF
  // - Complemento (se houver)

  // Move foco para o campo "Número"
}
```

## Campos do Cartório

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `code` | Sim | Código identificador (ex: "1º OFICIO") |
| `name` | Sim | Nome completo do cartório |
| `phone` | Sim | Telefone de contato |
| `email` | Não | Email de contato |
| `zipCode` | Sim | CEP do endereço |
| `street` | Sim | Logradouro |
| `number` | Sim | Número |
| `complement` | Não | Complemento |
| `neighborhood` | Sim | Bairro |
| `city` | Sim | Cidade |
| `state` | Sim | UF (2 caracteres) |
| `status` | Sim | Status (active/inactive) |
