import type { ContractStatus } from "@/types/contract"
import type { StatusType } from "@/components/ui/status-badge"

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

export function getContractStatusType(status: ContractStatus): StatusType {
  switch (status) {
    case "draft":
      return "warning"
    case "final":
      return "success"
    case "signed":
      return "info"
    default:
      return "neutral"
  }
}
