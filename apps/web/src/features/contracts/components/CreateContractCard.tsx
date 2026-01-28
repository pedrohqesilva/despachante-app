"use client"

import { ScrollText, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateContractCardProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function CreateContractCard({
  onClick,
  disabled,
  className,
}: CreateContractCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all",
        "border-2 border-dashed border-border/50 hover:border-primary/50",
        "bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10",
        "group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div
        className={cn(
          "size-12 rounded-xl flex items-center justify-center shrink-0",
          "bg-primary/10 border border-primary/20",
          "group-hover:bg-primary/20 group-hover:border-primary/30 transition-all"
        )}
      >
        <ScrollText className="size-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-text-secondary group-hover:text-primary transition-colors">
            Criar Contrato
          </p>
          <Plus className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gere um contrato a partir de um modelo com os dados do imovel
        </p>
      </div>
    </button>
  )
}
