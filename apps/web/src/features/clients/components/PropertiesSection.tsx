import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import { Building, Building2, Home, Trees, MapPin, Plus, Ruler, DollarSign, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface PropertiesSectionProps {
  clientId: Id<"clients">
}

const TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  house: { label: "Casa", icon: Home },
  apartment: { label: "Apartamento", icon: Building },
  land: { label: "Terreno", icon: Trees },
  building: { label: "Prédio", icon: Building2 },
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function PropertiesSection({ clientId }: PropertiesSectionProps) {
  const properties = useQuery(api.properties.listByClient, { clientId })
  const isLoading = properties === undefined

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

  if (!properties || properties.length === 0) {
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
          {properties.length} imóvel(is) vinculado(s)
        </p>
        <Button variant="outline" size="sm">
          <Plus className="size-4 mr-2" />
          Vincular Imóvel
        </Button>
      </div>

      <div className="space-y-3">
        {properties.map((property) => {
          const address = `${property.street}, ${property.number}, ${property.neighborhood}, ${property.city}/${property.state} - ${property.zipCode}`
          const typeConfig = TYPE_CONFIG[property.type] || { label: property.type, icon: Building2 }
          const TypeIcon = typeConfig.icon

          return (
            <div
              key={property._id}
              className="group p-4 rounded-xl border border-border/50 hover:border-border hover:bg-accent/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-accent border border-border flex items-center justify-center shrink-0">
                  <TypeIcon className="size-6 text-text-tertiary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    <p className="text-sm font-medium text-text-primary truncate">
                      {address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {typeConfig.label}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <span>{formatCurrency(property.value)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Ruler className="size-3" />
                      <span>{property.area.toLocaleString("pt-BR")} m²</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
