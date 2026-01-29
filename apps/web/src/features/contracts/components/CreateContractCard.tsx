"use client"

import { ScrollText } from "lucide-react"
import { IconContainer } from "@/components/ui/icon-container"
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
        "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all cursor-pointer",
        "border-2 border-dashed border-border/50 hover:border-primary/50",
        "bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10",
        "group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <IconContainer
        icon={ScrollText}
        size="lg"
        className="bg-primary/10 border-primary/20"
        iconClassName="text-primary"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-secondary group-hover:text-primary transition-colors">
          Criar Contrato
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gere um contrato a partir de um modelo com os dados do imovel
        </p>
      </div>
    </button>
  )
}
