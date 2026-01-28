import { useState, useMemo } from "react"
import { Search, ChevronDown, Check, X, Loader2 } from "lucide-react"
import { Id } from "@despachante/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatTaxId } from "@/lib/format"
import type { Client } from "@/types/client"

interface OwnerSelectorProps {
  selectedOwnerIds: Id<"clients">[]
  clients: Client[] | undefined
  onToggleOwner: (clientId: Id<"clients">) => void
  hasError?: boolean
  disabled?: boolean
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function OwnerSelector({
  selectedOwnerIds,
  clients,
  onToggleOwner,
  hasError,
  disabled,
}: OwnerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const isSearching = search.trim() !== "" && clients !== undefined

  const filteredClients = useMemo(() => {
    if (!clients) return []

    if (!search.trim()) {
      return clients
    }

    const searchNormalized = normalizeString(search.trim())
    const searchCleaned = search.replace(/\D/g, "")
    const searchWords = searchNormalized.split(/\s+/).filter((w) => w.length > 0)

    return clients.filter((client) => {
      const clientNameNormalized = normalizeString(client.name)
      const clientTaxIdCleaned = client.taxId.replace(/\D/g, "")
      const clientPhoneCleaned = client.phone?.replace(/\D/g, "") || ""

      const nameMatch = searchWords.length === 0 || searchWords.some((word) =>
        clientNameNormalized.includes(word)
      )

      const taxIdMatch = searchCleaned.length > 0 &&
        clientTaxIdCleaned.includes(searchCleaned)

      const phoneMatch = searchCleaned.length > 0 &&
        clientPhoneCleaned.length > 0 &&
        clientPhoneCleaned.includes(searchCleaned)

      return nameMatch || taxIdMatch || phoneMatch
    })
  }, [clients, search])

  const selectedOwners = clients?.filter((client) =>
    selectedOwnerIds.includes(client._id)
  ) || []

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Proprietários <span className="text-destructive">*</span>
      </p>
      <div className="space-y-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-10"
              type="button"
              aria-invalid={hasError}
              disabled={disabled}
            >
              <span className="text-muted-foreground">
                {selectedOwners.length > 0
                  ? `${selectedOwners.length} proprietário(s) selecionado(s)`
                  : "Selecione os proprietários"}
              </span>
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                autoComplete="off"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground px-2">Clientes</p>
              </div>

              <div className="p-1 pt-0">
                {clients === undefined || isSearching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {search.trim() ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
                  </p>
                ) : (
                  filteredClients.map((client) => {
                    const isSelected = selectedOwnerIds.includes(client._id)
                    return (
                      <div
                        key={client._id}
                        className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => onToggleOwner(client._id)}
                      >
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{client.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTaxId(client.taxId)}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {selectedOwners.length > 0 && (
          <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
            {selectedOwners.map((owner) => (
              <div
                key={owner._id}
                className="group flex items-center gap-3 px-3 py-2.5 bg-accent/30 hover:bg-accent/60 transition-colors"
              >
                <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {owner.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTaxId(owner.taxId)}
                  </p>
                </div>
                <button
                  type="button"
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  onClick={() => onToggleOwner(owner._id)}
                  disabled={disabled}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
