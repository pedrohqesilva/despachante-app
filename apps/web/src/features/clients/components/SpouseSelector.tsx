import { useState } from "react"
import { Search, Plus, ChevronDown, Check, Loader2, Heart, X } from "lucide-react"
import { Id } from "@despachante/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { formatTaxId } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Client } from "@/types/client"

interface SpouseSelectorProps {
  selectedSpouse: Client | null | undefined
  pendingSpouseName?: string
  pendingSpouseTaxId?: string
  searchResults: Client[] | undefined
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectSpouse: (clientId: Id<"clients">) => void
  onRemoveSpouse: () => void
  onCreateNew: () => void
  onRemovePending: () => void
  hasError?: boolean
}

export function SpouseSelector({
  selectedSpouse,
  pendingSpouseName,
  pendingSpouseTaxId,
  searchResults,
  searchQuery,
  onSearchChange,
  onSelectSpouse,
  onRemoveSpouse,
  onCreateNew,
  onRemovePending,
  hasError,
}: SpouseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectSpouse = (clientId: Id<"clients">) => {
    onSelectSpouse(clientId)
    setIsOpen(false)
    onSearchChange("")
  }

  const handleCreateNew = () => {
    setIsOpen(false)
    onCreateNew()
  }

  // Se há cônjuge selecionado (existente)
  if (selectedSpouse && !pendingSpouseName) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Cônjuge <span className="text-destructive">*</span>
        </Label>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="group flex items-center gap-3 px-3 py-2.5 bg-accent/30 hover:bg-accent/60 transition-colors">
            <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary">
                {selectedSpouse.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {selectedSpouse.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTaxId(selectedSpouse.taxId)}
              </p>
            </div>
            <button
              type="button"
              className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              onClick={onRemoveSpouse}
              aria-label="Remover cônjuge"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Se há cônjuge pendente (novo, ainda não salvo)
  if (pendingSpouseName) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Cônjuge <span className="text-destructive">*</span>
        </Label>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="group flex items-center gap-3 px-3 py-2.5 bg-status-warning-muted/30 hover:bg-status-warning-muted/50 transition-colors">
            <div className="size-8 rounded-full bg-status-warning-muted border border-status-warning-border flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-status-warning-foreground">
                {pendingSpouseName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {pendingSpouseName}
                <span className="ml-2 text-xs text-status-warning-foreground">(novo)</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {pendingSpouseTaxId ? formatTaxId(pendingSpouseTaxId.replace(/\D/g, "")) : "CPF não informado"}
              </p>
            </div>
            <button
              type="button"
              className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              onClick={onRemovePending}
              aria-label="Remover cônjuge pendente"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Se não há cônjuge selecionado - mostrar popover de seleção
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Cônjuge <span className="text-destructive">*</span>
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-10"
            type="button"
            aria-invalid={hasError}
          >
            <span className="text-muted-foreground">Selecione o cônjuge</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={-40}
          style={{ width: 'var(--radix-popover-trigger-width)', minWidth: '300px' }}
        >
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
              autoComplete="off"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {/* Ação: Criar novo */}
            <div className="p-1">
              <div
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                onClick={handleCreateNew}
              >
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Criar novo cliente</p>
                  <p className="text-xs text-muted-foreground">Adicionar como cônjuge</p>
                </div>
              </div>
            </div>

            {/* Separador com label */}
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-muted-foreground px-2">Clientes existentes</p>
            </div>

            {/* Lista de resultados */}
            <div className="p-1 pt-0">
              {searchResults === undefined ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum cliente encontrado.
                </p>
              ) : (
                searchResults.map((client) => {
                  const hasSpouse = !!client.spouseId
                  return (
                    <div
                      key={client._id}
                      className={cn(
                        "flex items-center gap-2 px-2 py-2 rounded-md",
                        hasSpouse
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-accent cursor-pointer"
                      )}
                      onClick={() => !hasSpouse && handleSelectSpouse(client._id)}
                    >
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {hasSpouse ? "Já possui cônjuge vinculado" : formatTaxId(client.taxId)}
                        </p>
                      </div>
                      {hasSpouse && (
                        <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
