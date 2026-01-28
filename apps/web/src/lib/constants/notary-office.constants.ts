import type { NotaryOfficeStatus } from "@/types/notary-office"

export const NOTARY_OFFICE_STATUS_OPTIONS = [
  { value: "active" as NotaryOfficeStatus, label: "Ativo" },
  { value: "inactive" as NotaryOfficeStatus, label: "Inativo" },
] as const

export function getNotaryOfficeStatusLabel(status: NotaryOfficeStatus): string {
  switch (status) {
    case "active":
      return "Ativo"
    case "inactive":
      return "Inativo"
    default:
      return status
  }
}

export function getNotaryOfficeStatusBadgeVariant(status: NotaryOfficeStatus): "default" | "secondary" {
  switch (status) {
    case "active":
      return "default"
    case "inactive":
      return "secondary"
    default:
      return "secondary"
  }
}

export function getNotaryOfficeStatusBadgeClassName(status: NotaryOfficeStatus): string {
  switch (status) {
    case "active":
      return "bg-status-success-muted text-status-success-foreground border-status-success-border font-medium"
    case "inactive":
      return "bg-status-neutral-muted text-status-neutral-foreground border-status-neutral-border font-medium"
    default:
      return ""
  }
}
