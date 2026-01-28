import type { ContractTemplateStatus, PlaceholderGroup } from "@/types/contract-template"

export const CONTRACT_TEMPLATE_STATUS_OPTIONS = [
  { value: "active" as ContractTemplateStatus, label: "Ativo" },
  { value: "inactive" as ContractTemplateStatus, label: "Inativo" },
] as const

export function getContractTemplateStatusLabel(status: ContractTemplateStatus): string {
  switch (status) {
    case "active":
      return "Ativo"
    case "inactive":
      return "Inativo"
    default:
      return status
  }
}

export function getContractTemplateStatusBadgeClassName(status: ContractTemplateStatus): string {
  switch (status) {
    case "active":
      return "bg-status-success-muted text-status-success-foreground border-status-success-border font-medium"
    case "inactive":
      return "bg-status-neutral-muted text-status-neutral-foreground border-status-neutral-border font-medium"
    default:
      return ""
  }
}

export const PLACEHOLDER_GROUPS: PlaceholderGroup[] = [
  {
    category: "Cliente",
    icon: "User",
    placeholders: [
      { key: "client.name", label: "Nome", example: "João da Silva" },
      { key: "client.cpf", label: "CPF", example: "123.456.789-00" },
      { key: "client.email", label: "Email", example: "joao@email.com" },
      { key: "client.phone", label: "Telefone", example: "(31) 99999-9999" },
      { key: "client.maritalStatus", label: "Estado Civil", example: "Casado" },
      { key: "client.fatherName", label: "Nome do Pai", example: "José da Silva" },
      { key: "client.motherName", label: "Nome da Mãe", example: "Maria da Silva" },
    ],
  },
  {
    category: "Imóvel",
    icon: "Building2",
    placeholders: [
      { key: "property.address", label: "Endereço Completo", example: "Rua das Palmeiras, 456, Apto 101" },
      { key: "property.street", label: "Logradouro", example: "Rua das Palmeiras" },
      { key: "property.number", label: "Número", example: "456" },
      { key: "property.complement", label: "Complemento", example: "Apto 101" },
      { key: "property.neighborhood", label: "Bairro", example: "Centro" },
      { key: "property.city", label: "Cidade", example: "Belo Horizonte" },
      { key: "property.state", label: "Estado", example: "MG" },
      { key: "property.zipCode", label: "CEP", example: "30000-000" },
      { key: "property.area", label: "Área (m²)", example: "120,50 m²" },
      { key: "property.value", label: "Valor", example: "R$ 350.000,00" },
      { key: "property.type", label: "Tipo", example: "Apartamento" },
    ],
  },
  {
    category: "Cartório",
    icon: "Landmark",
    placeholders: [
      { key: "notaryOffice.name", label: "Nome", example: "1º Ofício de Notas" },
      { key: "notaryOffice.code", label: "Código", example: "1º OFICIO" },
      { key: "notaryOffice.address", label: "Endereço", example: "Av. Brasil, 1000" },
      { key: "notaryOffice.city", label: "Cidade", example: "Belo Horizonte" },
    ],
  },
  {
    category: "Data",
    icon: "Calendar",
    placeholders: [
      { key: "date.current", label: "Data Atual", example: "28/01/2026" },
      { key: "date.currentExtended", label: "Data por Extenso", example: "28 de janeiro de 2026" },
    ],
  },
]
