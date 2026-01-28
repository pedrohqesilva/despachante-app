import { Home, Building, Building2, Trees, LucideIcon } from "lucide-react"
import type { PropertyType, PropertyStatus } from "@/types/property"

export interface PropertyTypeOption {
  value: PropertyType
  icon: LucideIcon
  label: string
}

export const PROPERTY_TYPE_OPTIONS: PropertyTypeOption[] = [
  { value: "land", icon: Trees, label: "Terreno" },
  { value: "house", icon: Home, label: "Casa" },
  { value: "apartment", icon: Building, label: "Apartamento" },
  { value: "building", icon: Building2, label: "Prédio" },
]

export const PROPERTY_STATUS_OPTIONS = [
  { value: "active" as PropertyStatus, label: "Ativo" },
  { value: "inactive" as PropertyStatus, label: "Inativo" },
  { value: "pending" as PropertyStatus, label: "Pendente" },
] as const

export function getPropertyTypeLabel(type: PropertyType): string {
  const option = PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === type)
  return option?.label ?? type
}

export function getPropertyTypeIcon(type: PropertyType): LucideIcon {
  const option = PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === type)
  return option?.icon ?? Building2
}

export function getPropertyStatusLabel(status: PropertyStatus): string {
  switch (status) {
    case "active":
      return "Ativo"
    case "inactive":
      return "Inativo"
    case "pending":
      return "Pendente"
    default:
      return status
  }
}

export function getPropertyStatusBadgeVariant(status: PropertyStatus): "default" | "secondary" | "outline" {
  switch (status) {
    case "active":
      return "default"
    case "inactive":
      return "secondary"
    case "pending":
      return "outline"
    default:
      return "secondary"
  }
}

export function getPropertyStatusBadgeClassName(status: PropertyStatus): string {
  switch (status) {
    case "active":
      return "bg-status-success-muted text-status-success-foreground border-status-success-border font-medium"
    case "inactive":
      return "bg-status-neutral-muted text-status-neutral-foreground border-status-neutral-border font-medium"
    case "pending":
      return "bg-status-warning-muted text-status-warning-foreground border-status-warning-border font-medium"
    default:
      return ""
  }
}
