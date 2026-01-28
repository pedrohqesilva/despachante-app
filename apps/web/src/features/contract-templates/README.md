# Feature: Contract Templates

Modulo responsavel pela gestao de modelos de contrato do sistema, incluindo funcionalidades de cadastro, edicao e listagem com editor rich text e sistema de placeholders.

## Estrutura

```
contract-templates/
├── components/
│   ├── ContractTemplateDialog.tsx       # Dialog de criacao/edicao de modelo
│   ├── ContractTemplateFormFields.tsx   # Campos do formulario (nome, descricao, status)
│   ├── ContractTemplatesTableActions.tsx # Menu de acoes da tabela
│   ├── TemplateEditor.tsx               # Editor TipTap para conteudo
│   └── PlaceholdersSidebar.tsx          # Sidebar com placeholders clicaveis
├── hooks/
│   └── useContractTemplateForm.ts       # Hook de gerenciamento do formulario
├── index.ts                              # Barrel export
└── README.md                             # Esta documentacao
```

## Componentes

### ContractTemplateDialog

Dialog principal para criacao e edicao de modelos de contrato.

**Props:**
```typescript
interface ContractTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contractTemplate?: ContractTemplate | null  // Modelo para edicao (null = criacao)
  onSave: (data: ContractTemplateDialogSaveData) => Promise<void>
}
```

**Caracteristicas:**
- Layout responsivo com editor a esquerda e sidebar de placeholders a direita
- Modo criacao e edicao
- Validacao de campos obrigatorios
- Campo de status apenas em modo edicao
- Integracao entre editor e sidebar de placeholders

### ContractTemplateFormFields

Campos reutilizaveis do formulario de modelo.

**Secoes:**
1. **Informacoes do Modelo** - Nome, Descricao, Status (apenas edicao)

**Props:**
```typescript
interface ContractTemplateFormFieldsProps {
  formData: ContractTemplateFormData
  errors: ContractTemplateFormErrors
  onFieldChange: (field, value) => void
  isEditing?: boolean
  disabled?: boolean
}
```

### TemplateEditor

Editor rich text baseado em TipTap para edicao do conteudo do modelo.

**Props:**
```typescript
interface TemplateEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  hasError?: boolean
}
```

**Ref (TemplateEditorRef):**
```typescript
interface TemplateEditorRef {
  insertText: (text: string) => void
  focus: () => void
}
```

**Caracteristicas:**
- Toolbar com botoes de formatacao (negrito, italico, listas)
- Botoes de desfazer/refazer
- Placeholder text quando vazio
- Suporte a insercao de texto via ref (para placeholders)
- Estilos prose do Tailwind

### PlaceholdersSidebar

Sidebar com grupos de placeholders organizados por categoria.

**Props:**
```typescript
interface PlaceholdersSidebarProps {
  onPlaceholderClick: (placeholder: string) => void
  disabled?: boolean
  className?: string
}
```

**Caracteristicas:**
- Grupos expansiveis/colapsaveis por categoria
- Icones por categoria (User, Building2, Landmark, Calendar)
- Tooltip com exemplo e formato do placeholder
- Clique insere `{{placeholder.key}}` no editor

**Categorias de Placeholders:**
- Cliente (nome, CPF, email, telefone, etc.)
- Imovel (endereco, area, valor, tipo, etc.)
- Cartorio (nome, codigo, endereco, etc.)
- Data (data atual, data por extenso)

### ContractTemplatesTableActions

Menu de acoes para cada linha da tabela.

**Props:**
```typescript
interface ContractTemplatesTableActionsProps {
  contractTemplate: ContractTemplate
  onEdit?: (contractTemplate: ContractTemplate) => void
  onDelete?: (contractTemplate: ContractTemplate) => Promise<void>
}
```

**Acoes:**
- Editar modelo
- Excluir modelo (com confirmacao)

## Hooks

### useContractTemplateForm

Hook que encapsula toda a logica do formulario de modelo de contrato.

**Retorno:**
```typescript
{
  formData: ContractTemplateFormData
  errors: ContractTemplateFormErrors
  updateField: (field, value) => void
  validate: () => boolean
  getSubmitData: () => ContractTemplateSubmitData
  reset: (template?) => void
  insertTextAtContent: (text, cursorPosition?) => void
  setErrors: (errors) => void
}
```

**Validacoes:**
- Nome obrigatorio
- Conteudo obrigatorio

## Tipos

```typescript
// Dados do formulario
interface ContractTemplateFormData {
  name: string
  description: string
  content: string
  status: ContractTemplateStatus
}

// Erros de validacao
interface ContractTemplateFormErrors {
  name?: boolean
  content?: boolean
}

// Dados para submissao
interface ContractTemplateSubmitData {
  name: string
  description: string | undefined
  content: string
  status: ContractTemplateStatus
}

// Dados do save no dialog
interface ContractTemplateDialogSaveData {
  data: ContractTemplateSubmitData
  isEditing: boolean
}

// Status do modelo
type ContractTemplateStatus = "active" | "inactive"
```

## Uso

### Listagem de Modelos

```tsx
import {
  ContractTemplateDialog,
  ContractTemplatesTableActions
} from "@/features/contract-templates"

function ContractTemplatesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null)

  const handleEdit = (template: ContractTemplate) => {
    setEditingTemplate(template)
    setIsDialogOpen(true)
  }

  const handleOpenNew = () => {
    setEditingTemplate(null)
    setIsDialogOpen(true)
  }

  const handleSave = async ({ data, isEditing }: ContractTemplateDialogSaveData) => {
    if (isEditing && editingTemplate) {
      await updateContractTemplate({ id: editingTemplate._id, ...data })
      toast.success("Modelo atualizado com sucesso")
    } else {
      await createContractTemplate(data)
      toast.success("Modelo criado com sucesso")
    }
  }

  return (
    <>
      <Button onClick={handleOpenNew}>
        Novo Modelo
      </Button>

      <ContractTemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contractTemplate={editingTemplate}
        onSave={handleSave}
      />

      <Table>
        {templates.map(template => (
          <TableRow key={template._id}>
            <TableCell>{template.name}</TableCell>
            <TableCell>{template.description}</TableCell>
            <TableCell>
              <ContractTemplatesTableActions
                contractTemplate={template}
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

## Integracao com Backend

### Queries (Convex)

| Query | Descricao |
|-------|-----------|
| `contractTemplates.list` | Lista paginada com filtros e ordenacao |
| `contractTemplates.getById` | Busca modelo por ID |
| `contractTemplates.getActive` | Lista apenas modelos ativos |

### Mutations (Convex)

| Mutation | Descricao |
|----------|-----------|
| `contractTemplates.create` | Cria novo modelo |
| `contractTemplates.update` | Atualiza modelo existente |
| `contractTemplates.remove` | Remove modelo |

## Constantes Relacionadas

Arquivo: `lib/constants/contract-template.constants.ts`

```typescript
// Opcoes de status
CONTRACT_TEMPLATE_STATUS_OPTIONS

// Grupos de placeholders
PLACEHOLDER_GROUPS

// Funcoes utilitarias
getContractTemplateStatusLabel(status)
getContractTemplateStatusBadgeClassName(status)
```

## Dependencias Externas

- `@tiptap/react` - Core do editor
- `@tiptap/starter-kit` - Extensoes basicas (bold, italic, lists, etc.)
- `@tiptap/extension-placeholder` - Placeholder quando editor vazio
- `@tiptap/pm` - ProseMirror dependencies

## Campos do Modelo

| Campo | Obrigatorio | Descricao |
|-------|-------------|-----------|
| `name` | Sim | Nome do modelo de contrato |
| `description` | Nao | Descricao do proposito do modelo |
| `content` | Sim | Conteudo HTML do modelo (com placeholders) |
| `status` | Sim | Status (active/inactive) |
| `createdAt` | Auto | Data de criacao |
| `updatedAt` | Auto | Data de ultima atualizacao |

## Placeholders Disponiveis

Os placeholders sao substituidos automaticamente ao gerar um contrato:

### Cliente
- `{{client.name}}` - Nome completo
- `{{client.cpf}}` - CPF formatado
- `{{client.email}}` - Email
- `{{client.phone}}` - Telefone
- `{{client.maritalStatus}}` - Estado civil
- `{{client.fatherName}}` - Nome do pai
- `{{client.motherName}}` - Nome da mae

### Imovel
- `{{property.address}}` - Endereco completo
- `{{property.street}}` - Logradouro
- `{{property.number}}` - Numero
- `{{property.complement}}` - Complemento
- `{{property.neighborhood}}` - Bairro
- `{{property.city}}` - Cidade
- `{{property.state}}` - Estado
- `{{property.zipCode}}` - CEP
- `{{property.area}}` - Area em m²
- `{{property.value}}` - Valor formatado
- `{{property.type}}` - Tipo do imovel

### Cartorio
- `{{notaryOffice.name}}` - Nome do cartorio
- `{{notaryOffice.code}}` - Codigo
- `{{notaryOffice.address}}` - Endereco
- `{{notaryOffice.city}}` - Cidade

### Data
- `{{date.current}}` - Data atual (DD/MM/YYYY)
- `{{date.currentExtended}}` - Data por extenso
