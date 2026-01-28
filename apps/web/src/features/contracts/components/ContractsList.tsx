"use client"

import { useQuery } from "convex/react"
import { ScrollText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDateOnly } from "@/lib/format"
import {
  getContractStatusLabel,
  getContractStatusBadgeClassName,
} from "@/lib/constants/contract.constants"
import { contractsApi } from "@/lib/api"
import type { Id } from "@despachante/convex/_generated/dataModel"
import type { Contract, ContractStatus } from "@/types/contract"

interface ContractsListProps {
  clientId: Id<"clients">
  onContractClick?: (contract: Contract) => void
  className?: string
}

export function ContractsList({
  clientId,
  onContractClick,
  className,
}: ContractsListProps) {
  const contracts = useQuery(contractsApi.queries.listByClient, { clientId })

  if (!contracts || contracts.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="size-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
          <ScrollText className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhum contrato encontrado
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {contracts.map((contract) => (
        <button
          key={contract._id}
          type="button"
          onClick={() => onContractClick?.(contract as Contract)}
          className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border border-border bg-accent/50 hover:bg-accent hover:border-border group"
        >
          <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20 text-primary">
            <ScrollText className="size-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-text-secondary truncate">
                {contract.name}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 text-xs",
                  getContractStatusBadgeClassName(contract.status as ContractStatus)
                )}
              >
                {getContractStatusLabel(contract.status as ContractStatus)}
              </Badge>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">
              {formatDateOnly(contract.createdAt)}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
