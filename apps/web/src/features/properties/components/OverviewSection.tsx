import { Copy, Home, Building2, LandPlot, Building, MapPin, LucideIcon } from "lucide-react"
import { formatCurrency, formatArea, formatZipCode } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type PropertyType = "house" | "apartment" | "land" | "building"
type PropertyStatus = "active" | "inactive" | "pending"

interface Property {
  _id: string
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  type: string
  area: number
  value: number
  status: string
  ownerIds: string[]
  createdAt: number
  updatedAt: number
}

interface OverviewSectionProps {
  property: Property
}

const TYPE_CONFIG: Record<PropertyType, { label: string; icon: LucideIcon }> = {
  house: { label: "Casa", icon: Home },
  apartment: { label: "Apartamento", icon: Building2 },
  land: { label: "Terreno", icon: LandPlot },
  building: { label: "Predio", icon: Building },
}

const STATUS_CONFIG: Record<PropertyStatus, { label: string; className: string }> = {
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

export function OverviewSection({ property }: OverviewSectionProps) {
  const typeConfig = TYPE_CONFIG[property.type as PropertyType] || { label: property.type, icon: Building2 }
  const statusConfig = STATUS_CONFIG[property.status as PropertyStatus] || STATUS_CONFIG.pending
  const TypeIcon = typeConfig.icon

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  const fullAddress = `${property.street}, ${property.number}${property.complement ? ` - ${property.complement}` : ""}, ${property.neighborhood}, ${property.city}/${property.state} - CEP: ${formatZipCode(property.zipCode)}`

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-linear-to-br from-accent/80 to-accent/40 border border-border">
        <div className="flex items-center gap-5">
          <div className="size-20 rounded-2xl bg-background border-2 border-border flex items-center justify-center shrink-0 shadow-sm">
            <TypeIcon className="size-10 text-text-secondary" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h3 className="text-xl font-semibold text-text-primary truncate">
                {property.street}, {property.number}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {property.neighborhood}, {property.city}/{property.state}
                </span>
                <button
                  onClick={() => copyToClipboard(fullAddress, "Endereco")}
                  className="text-muted-foreground hover:text-text-primary transition-colors cursor-pointer"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={statusConfig.className}
              >
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className="bg-accent/50">
                {typeConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-border/50">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border/50">
            <span className="text-xs text-muted-foreground">Area</span>
            <span className="text-sm font-semibold text-text-primary">{formatArea(property.area)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border/50">
            <span className="text-xs text-muted-foreground">Valor</span>
            <span className="text-sm font-semibold text-text-primary">{formatCurrency(property.value)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-5 rounded-xl border border-border/50 bg-card">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Endereco Completo</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {property.street}, {property.number}
                  {property.complement && ` - ${property.complement}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {property.neighborhood}
                </p>
                <p className="text-sm text-muted-foreground">
                  {property.city} - {property.state}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  CEP: {formatZipCode(property.zipCode)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Detalhes do Imovel</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="text-sm font-medium text-text-primary">{typeConfig.label}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium text-text-primary">{statusConfig.label}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Area</p>
              <p className="text-sm font-medium text-text-primary">{formatArea(property.area)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-sm font-medium text-text-primary">{formatCurrency(property.value)}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Localizacao</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Cidade</p>
              <p className="text-sm font-medium text-text-primary">{property.city}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <p className="text-sm font-medium text-text-primary">{property.state}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bairro</p>
              <p className="text-sm font-medium text-text-primary">{property.neighborhood}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CEP</p>
              <p className="text-sm font-medium text-text-primary font-mono">{formatZipCode(property.zipCode)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
