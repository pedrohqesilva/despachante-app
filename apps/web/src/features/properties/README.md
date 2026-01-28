# Feature: Properties

Módulo responsável pela gestão de imóveis do sistema, incluindo funcionalidades de cadastro, edição, listagem e vinculação de proprietários.

## Estrutura

```
properties/
├── components/
│   ├── PropertyDialog.tsx       # Dialog de criação/edição de imóvel
│   ├── PropertyFormFields.tsx   # Campos do formulário (dados, localização)
│   ├── PropertyTypeSelector.tsx # Seletor visual de tipo de imóvel
│   ├── OwnerSelector.tsx        # Seletor de proprietários
│   ├── PropertyTableRow.tsx     # Linha da tabela com popover de proprietários
│   ├── PropertiesTableActions.tsx # Menu de ações da tabela
│   ├── DocumentsSection.tsx     # Seção de documentos na página de detalhes
│   ├── ExportButton.tsx         # Botão de exportação CSV/Excel
│   ├── OverviewSection.tsx      # Seção de visão geral na página de detalhes
│   └── OwnersSection.tsx        # Seção de proprietários na página de detalhes
├── hooks/
│   └── usePropertyForm.ts       # Hook de gerenciamento do formulário
├── index.ts                      # Barrel export
└── README.md                     # Esta documentação
```

## Componentes

### PropertyDialog

Dialog principal para criação e edição de imóveis.

**Props:**
```typescript
interface PropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property?: Property | null      // Imóvel para edição (null = criação)
  onSave: (data: PropertyDialogSaveData) => Promise<void>
  showOwnerSelector?: boolean     // Se deve exibir seletor de proprietários
}
```

**Características:**
- Modo criação e edição
- Busca automática de CEP via ViaCEP
- Seletor visual de tipo de imóvel
- Seleção múltipla de proprietários
- Validação de campos obrigatórios

### PropertyFormFields

Campos reutilizáveis do formulário de imóvel.

**Seções:**
1. **Dados do Imóvel** - Área (m²), Valor (R$)
2. **Localização** - CEP, Logradouro, Número, Complemento, Bairro, Cidade, UF

**Props:**
```typescript
interface PropertyFormFieldsProps {
  formData: PropertyFormData
  errors: PropertyFormErrors
  onFieldChange: (field, value) => void
  onZipCodeChange: (value: string) => void   // Com busca de CEP
  onValueChange: (value: string) => void     // Formatação monetária
  onAreaChange: (value: string) => void      // Formatação de área
  onStateChange: (value: string) => void     // Uppercase automático
  getFormattedArea: () => string
  isLoadingCep?: boolean
  numberInputRef?: RefObject<HTMLInputElement>
  disabled?: boolean
}
```

### PropertyTypeSelector

Seletor visual de tipo de imóvel com ícones.

**Tipos Disponíveis:**
| Tipo | Ícone | Label |
|------|-------|-------|
| `land` | Trees | Terreno |
| `house` | Home | Casa |
| `apartment` | Building | Apartamento |
| `building` | Building2 | Prédio |

**Props:**
```typescript
interface PropertyTypeSelectorProps {
  value: PropertyType | ""
  onChange: (value: PropertyType) => void
  hasError?: boolean
  disabled?: boolean
}
```

### OwnerSelector

Componente para seleção múltipla de proprietários.

**Props:**
```typescript
interface OwnerSelectorProps {
  selectedOwnerIds: Id<"clients">[]
  clients?: Client[]
  onToggleOwner: (clientId: Id<"clients">) => void
  hasError?: boolean
  disabled?: boolean
}
```

**Funcionalidades:**
- Lista de clientes disponíveis
- Seleção múltipla via checkbox
- Indicação visual de selecionados
- Validação de mínimo 1 proprietário

### PropertyTableRow

Linha customizada da tabela com funcionalidades avançadas.

**Props:**
```typescript
interface PropertyTableRowProps {
  property: Property
  owners: Client[]
  onEdit: (property: Property) => void
  onDelete: (property: Property) => Promise<void>
  onRowClick: (property: Property) => void
  onNavigateToClient: (clientId: Id<"clients">) => void
  onRemoveOwnerRequest: (propertyId, ownerId, ownerName, currentOwnerIds) => void
  isRemovingOwner: boolean
  removingOwnerId: Id<"clients"> | null
}
```

**Funcionalidades:**
- Popover com lista de proprietários
- Navegação para página do cliente
- Remoção de proprietário inline
- Badge de status com cores semânticas

## Hooks

### usePropertyForm

Hook que encapsula toda a lógica do formulário de imóvel.

**Retorno:**
```typescript
{
  formData: PropertyFormData
  errors: PropertyFormErrors
  updateField: (field, value) => void
  handleZipCodeChange: (value) => void  // Com formatação
  handleValueChange: (value) => void    // Formatação monetária
  handleAreaChange: (value) => void     // Formatação de área
  handleStateChange: (value) => void    // Uppercase
  setAddressFromCep: (address) => void  // Preenche campos do CEP
  toggleOwner: (clientId) => void       // Adiciona/remove proprietário
  getFormattedArea: () => string
  validate: (requireOwners?) => boolean
  getSubmitData: () => PropertySubmitData
  reset: (property?) => void
}
```

**Validações:**
- Tipo obrigatório
- CEP obrigatório (8 dígitos)
- Logradouro obrigatório
- Número obrigatório
- Bairro obrigatório
- Cidade obrigatória
- UF obrigatória (2 caracteres)
- Área obrigatória (> 0)
- Valor obrigatório (> 0)
- Pelo menos 1 proprietário (quando aplicável)

## Tipos

```typescript
// Dados do formulário
interface PropertyFormData {
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  type: PropertyType | ""
  area: string
  value: string
  ownerIds: Id<"clients">[]
  status: PropertyStatus | ""
}

// Erros de validação
interface PropertyFormErrors {
  zipCode?: boolean
  street?: boolean
  number?: boolean
  neighborhood?: boolean
  city?: boolean
  state?: boolean
  type?: boolean
  area?: boolean
  value?: boolean
  ownerIds?: boolean
}

// Dados para submissão
interface PropertySubmitData {
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  type: PropertyType
  area: number
  value: number
  ownerIds: Id<"clients">[]
  status?: PropertyStatus
}

// Tipos de imóvel
type PropertyType = "land" | "house" | "apartment" | "building"

// Status do imóvel
type PropertyStatus = "active" | "inactive" | "pending"
```

## Uso

### Listagem de Imóveis

```tsx
import {
  PropertyDialog,
  PropertyTableRow,
  PropertiesTableActions,
  ExportButton
} from "@/features/properties"

function PropertiesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  return (
    <>
      <ExportButton properties={properties} />

      <PropertyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        property={editingProperty}
        onSave={handleSave}
      />

      {properties.map(property => (
        <PropertyTableRow
          key={property._id}
          property={property}
          owners={getOwners(property)}
          onEdit={setEditingProperty}
          onDelete={handleDelete}
          onRowClick={handleRowClick}
          onNavigateToClient={navigateToClient}
          onRemoveOwnerRequest={handleRemoveOwner}
          isRemovingOwner={isRemovingOwner}
          removingOwnerId={removingOwnerId}
        />
      ))}
    </>
  )
}
```

### Página de Detalhes

```tsx
import { OverviewSection, OwnersSection, DocumentsSection } from "@/features/properties"

function PropertyDetailsPage() {
  return (
    <div>
      <OverviewSection property={property} />
      <OwnersSection owners={owners} />
      <DocumentsSection documents={documents} />
    </div>
  )
}
```

## Integração com Backend

### Queries (Convex)

| Query | Descrição |
|-------|-----------|
| `properties.list` | Lista paginada com filtros e ordenação |
| `properties.get` | Busca imóvel por ID |
| `properties.checkDuplicates` | Verifica duplicatas por endereço |

### Mutations (Convex)

| Mutation | Descrição |
|----------|-----------|
| `properties.create` | Cria novo imóvel |
| `properties.update` | Atualiza imóvel existente |
| `properties.deleteProperty` | Remove imóvel |

## Constantes Relacionadas

Arquivo: `lib/constants/property.constants.ts`

```typescript
// Opções de tipo de imóvel
PROPERTY_TYPE_OPTIONS

// Opções de status
PROPERTY_STATUS_OPTIONS

// Funções utilitárias
getPropertyTypeLabel(type)
getPropertyTypeIcon(type)
getPropertyStatusLabel(status)
getPropertyStatusBadgeVariant(status)
getPropertyStatusBadgeClassName(status)
```

## Formatadores

Arquivo: `lib/format.ts`

```typescript
formatZipCode(value)    // Formata CEP (00000-000)
formatCurrency(value)   // Formata valor monetário (R$ 1.234,56)
formatArea(value)       // Formata área (1.234,56 m²)
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
