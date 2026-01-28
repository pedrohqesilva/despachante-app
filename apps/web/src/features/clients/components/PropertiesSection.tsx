import { useQuery } from "convex/react"
import { propertiesApi } from "@/lib/api"
import { Id } from "@despachante/convex/_generated/dataModel"
import { Building, Building2, Home, Trees, Plus, ExternalLink, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatArea } from "@/lib/format"
import { cn } from "@/lib/utils"

interface PropertiesSectionProps {
  clientId: Id<"clients">
}

const TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  house: { label: "Casa", icon: Home },
  apartment: { label: "Apartamento", icon: Building },
  land: { label: "Terreno", icon: Trees },
  building: { label: "Prédio", icon: Building2 },
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  pending: { label: "Pendente", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  inactive: { label: "Inativo", className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
}

export function PropertiesSection({ clientId }: PropertiesSectionProps) {
  const propertiesData = useQuery(propertiesApi.queries.listByClient, { clientId })
  const isLoading = propertiesData === undefined

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/50">
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 rounded-lg" />
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

  if (!propertiesData || propertiesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Building2 className="size-8 text-primary" />
        </div>
        <p className="text-base font-semibold text-text-secondary">
          Nenhum imóvel vinculado
        </p>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
          Este cliente ainda não possui imóveis cadastrados.
        </p>
        <Button variant="outline" className="mt-4">
          <Plus className="size-4 mr-2" />
          Vincular Imóvel
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {propertiesData.length} imóvel(is) vinculado(s)
        </p>
        <Button variant="outline" size="sm">
          <Plus className="size-4 mr-2" />
          Vincular Imóvel
        </Button>
      </div>

      <div className="space-y-3">
        {propertiesData.map((property) => {
          const typeConfig = TYPE_CONFIG[property.type] || { label: property.type, icon: Building2 }
          const statusConfig = STATUS_CONFIG[property.status] || STATUS_CONFIG.pending
          const TypeIcon = typeConfig.icon

          return (
            <div
              key={property._id}
              className="group p-4 rounded-xl border border-border bg-accent/50 hover:bg-accent hover:border-border transition-all cursor-pointer relative"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                  <TypeIcon className="size-6 text-text-tertiary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-secondary truncate">
                    {property.street}, {property.number}
                    {property.complement && ` - ${property.complement}`}, {property.neighborhood}, {property.city}/{property.state}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">

                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                      statusConfig.className
                    )}>
                      {statusConfig.label}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground bg-accent px-1.5 py-0.5 rounded border border-border">
                      {typeConfig.label}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 opacity-100 group-hover:opacity-0 transition-opacity duration-200 absolute right-4">
                  <span className="text-sm font-semibold text-text-secondary">{formatCurrency(property.value)}</span>
                  <span className="text-xs text-muted-foreground">{formatArea(property.area)}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
