import type { ContractStatus } from "@/types/contract"

export const CONTRACT_STATUS_OPTIONS = [
  { value: "draft" as ContractStatus, label: "Rascunho" },
  { value: "final" as ContractStatus, label: "Finalizado" },
  { value: "signed" as ContractStatus, label: "Assinado" },
] as const

export function getContractStatusLabel(status: ContractStatus): string {
  switch (status) {
    case "draft":
      return "Rascunho"
    case "final":
      return "Finalizado"
    case "signed":
      return "Assinado"
    default:
      return status
  }
}

export function getContractStatusBadgeClassName(status: ContractStatus): string {
  switch (status) {
    case "draft":
      return "bg-status-warning-muted text-status-warning-foreground border-status-warning-border font-medium"
    case "final":
      return "bg-status-success-muted text-status-success-foreground border-status-success-border font-medium"
    case "signed":
      return "bg-status-info-muted text-status-info-foreground border-status-info-border font-medium"
    default:
      return ""
  }
}
