import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { useNavigate } from "react-router-dom"
import { clientsApi, propertiesApi } from "@/lib/api"
import { Id } from "@despachante/convex/_generated/dataModel"
import {
  Users,
  Plus,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { formatTaxId } from "@/lib/format"
import { TrashButton } from "@/components/ui/trash-button"

interface OwnersSectionProps {
  propertyId: Id<"properties">
  ownerIds: Id<"clients">[]
}

type ClientStatus = "active" | "inactive" | "pending"

const STATUS_CONFIG: Record<ClientStatus, { label: string; className: string }> = {
  active: {
    label: "Ativo",
    className: "bg-status-success-muted text-status-success-foreground border-status-success-border",
  },
  pending: {
    label: "Pendente",
    className: "bg-status-warning-muted text-status-warning-foreground border-status-warning-border",
  },
  inactive: {
    label: "Inativo",
    className: "bg-status-neutral-muted text-status-neutral-foreground border-status-neutral-border",
  },
}

export function OwnersSection({ propertyId, ownerIds }: OwnersSectionProps) {
  const navigate = useNavigate()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const ownersData = useQuery(
    clientsApi.queries.list,
    { page: 1, pageSize: 100 }
  )

  const allClientsData = useQuery(
    clientsApi.queries.list,
    isPopoverOpen ? { page: 1, pageSize: 100, search: searchQuery || undefined } : "skip"
  )

  const updatePropertyMutation = useMutation(propertiesApi.mutations.update)

  const owners = useMemo(() => {
    if (!ownersData?.clients) return []
    return ownersData.clients.filter(client => ownerIds.includes(client._id))
  }, [ownersData, ownerIds])

  const availableClients = useMemo(() => {
    if (!allClientsData?.clients) return []
    return allClientsData.clients.filter(client => !ownerIds.includes(client._id))
  }, [allClientsData, ownerIds])

  const isLoading = ownersData === undefined

  const handleAddOwner = async (clientId: Id<"clients">) => {
    setIsUpdating(true)
    try {
      await updatePropertyMutation({
        id: propertyId,
        ownerIds: [...ownerIds, clientId],
      })
      toast.success("Proprietario adicionado com sucesso")
      setIsPopoverOpen(false)
      setSearchQuery("")
    } catch (error) {
      toast.error("Erro ao adicionar proprietario")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveOwner = async (clientId: Id<"clients">) => {
    if (ownerIds.length <= 1) {
      toast.error("O imovel deve ter pelo menos um proprietario")
      return
    }

    setIsUpdating(true)
    try {
      await updatePropertyMutation({
        id: propertyId,
        ownerIds: ownerIds.filter(id => id !== clientId),
      })
      toast.success("Proprietario removido com sucesso")
    } catch (error) {
      toast.error("Erro ao remover proprietario")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/50">
            <div className="flex items-start gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (owners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Users className="size-8 text-primary" />
        </div>
        <p className="text-base font-semibold text-text-secondary">
          Nenhum proprietario cadastrado
        </p>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
          Adicione proprietarios a este imovel.
        </p>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mt-4">
              <Plus className="size-4 mr-2" />
              Adicionar Proprietario
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="center">
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                autoComplete="off"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {allClientsData === undefined ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : availableClients.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum cliente encontrado.
                </p>
              ) : (
                availableClients.map((client) => (
                  <div
                    key={client._id}
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => !isUpdating && handleAddOwner(client._id)}
                  >
                    <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatTaxId(client.taxId)}
                      </p>
                    </div>
                    {isUpdating && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {owners.length} proprietario(s) cadastrado(s)
        </p>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="size-4 mr-2" />
              Adicionar Proprietario
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                autoComplete="off"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {allClientsData === undefined ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : availableClients.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum cliente encontrado.
                </p>
              ) : (
                availableClients.map((client) => (
                  <div
                    key={client._id}
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => !isUpdating && handleAddOwner(client._id)}
                  >
                    <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatTaxId(client.taxId)}
                      </p>
                    </div>
                    {isUpdating && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-3">
        {owners.map((owner) => {
          const statusConfig = STATUS_CONFIG[owner.status as ClientStatus] || STATUS_CONFIG.pending

          return (
            <div
              key={owner._id}
              className="group p-4 rounded-xl border border-border bg-accent/50 hover:bg-accent hover:border-border transition-all cursor-pointer relative"
              onClick={(e) => {
                const target = e.target as HTMLElement
                if (target.closest('[data-actions]')) return
                navigate(`/clientes/${owner._id}`)
              }}
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-background border-2 border-border flex items-center justify-center shrink-0">
                  <span className="text-lg font-semibold text-text-secondary">
                    {owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {owner.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatTaxId(owner.taxId)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 opacity-100 group-hover:opacity-0 transition-opacity duration-200 absolute right-4">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] py-0", statusConfig.className)}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
                <div data-actions className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-accent rounded-lg p-1 -m-1 relative z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/clientes/${owner._id}`)
                    }}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                  <TrashButton
                    onClick={() => handleRemoveOwner(owner._id)}
                    disabled={ownerIds.length <= 1}
                    isLoading={isUpdating}
                    title={ownerIds.length <= 1 ? "O imóvel deve ter pelo menos um proprietário" : "Remover proprietário"}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
