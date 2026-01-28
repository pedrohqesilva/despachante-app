import { UserRound, HeartHandshake, Gem, CircleDashed, X } from "lucide-react"
import type { MaritalStatus, PropertyRegime, ClientStatus } from "@/types/client"

export const MARITAL_STATUS_OPTIONS = [
  { value: "single" as MaritalStatus, icon: UserRound, label: "Solteiro(a)" },
  { value: "common_law_marriage" as MaritalStatus, icon: HeartHandshake, label: "União Estável" },
  { value: "married" as MaritalStatus, icon: Gem, label: "Casado(a)" },
  { value: "widowed" as MaritalStatus, icon: CircleDashed, label: "Viúvo(a)" },
  { value: "divorced" as MaritalStatus, icon: X, label: "Divorciado(a)" },
] as const

export const PROPERTY_REGIME_OPTIONS = [
  { value: "partial_communion" as PropertyRegime, label: "Comunhão Parcial de Bens" },
  { value: "total_communion" as PropertyRegime, label: "Comunhão Total de Bens" },
  { value: "total_separation" as PropertyRegime, label: "Separação Total de Bens" },
] as const

export const CLIENT_STATUS_OPTIONS = [
  { value: "active" as ClientStatus, label: "Ativo" },
  { value: "inactive" as ClientStatus, label: "Inativo" },
  { value: "pending" as ClientStatus, label: "Pendente" },
] as const

export function requiresSpouse(status: MaritalStatus | string): boolean {
  return status === "married" || status === "common_law_marriage"
}

export function getMaritalStatusLabel(status: MaritalStatus): string {
  return MARITAL_STATUS_OPTIONS.find(opt => opt.value === status)?.label ?? status
}

export function getPropertyRegimeLabel(regime: PropertyRegime): string {
  return PROPERTY_REGIME_OPTIONS.find(opt => opt.value === regime)?.label ?? regime
}

export function getClientStatusLabel(status: ClientStatus): string {
  return CLIENT_STATUS_OPTIONS.find(opt => opt.value === status)?.label ?? status
}
