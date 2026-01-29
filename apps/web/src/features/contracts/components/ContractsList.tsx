"use client"

import { ScrollText } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { IconContainer } from "@/components/ui/icon-container"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { formatDateOnly } from "@/lib/format"
import {
  getContractStatusLabel,
  getContractStatusType,
} from "@/lib/constants/contract.constants"
import type { Contract, ContractStatus } from "@/types/contract"

interface ContractsListProps {
  contracts: Contract[] | undefined
  onContractClick?: (contract: Contract) => void
  className?: string
}

export function ContractsList({
  contracts,
  onContractClick,
  className,
}: ContractsListProps) {

  if (!contracts || contracts.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="Nenhum contrato encontrado"
        compact
        className={className}
      />
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {contracts.map((contract) => (
        <button
          key={contract._id}
          type="button"
          onClick={() => onContractClick?.(contract)}
          className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border border-border bg-accent/50 hover:bg-accent hover:border-border group"
        >
          <IconContainer
            icon={ScrollText}
            size="md"
            className="bg-primary/10 border-primary/20"
            iconClassName="text-primary"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-text-secondary truncate">
                {contract.name}
              </p>
              <StatusBadge
                status={getContractStatusType(contract.status as ContractStatus)}
                className="shrink-0 text-xs"
              >
                {getContractStatusLabel(contract.status as ContractStatus)}
              </StatusBadge>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">
              {formatDateOnly(contract._creationTime)}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
