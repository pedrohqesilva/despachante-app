import { Mail, Copy, ExternalLink } from "lucide-react"
import { formatTaxId, formatPhone } from "@/lib/format"
import { Client, MaritalStatus, PropertyRegime } from "@/types/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

interface OverviewSectionProps {
  client: Client
  spouse?: Client | null
}

const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: "Solteiro(a)",
  common_law_marriage: "União Estável",
  married: "Casado(a)",
  widowed: "Viúvo(a)",
  divorced: "Divorciado(a)",
}

const PROPERTY_REGIME_LABELS: Record<PropertyRegime, string> = {
  partial_communion: "Comunhão Parcial de Bens",
  total_communion: "Comunhão Total de Bens",
  total_separation: "Separação Total de Bens",
}

export function OverviewSection({ client, spouse }: OverviewSectionProps) {
  const navigate = useNavigate()

  const requiresSpouse = client.maritalStatus === "married" || client.maritalStatus === "common_law_marriage"
  const isMarried = client.maritalStatus === "married"
  const dateLabel = isMarried ? "Data do Casamento" : "Desde"

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-accent/80 to-accent/40 border border-border">
        <div className="flex items-center gap-5">
          <div className="size-20 rounded-2xl bg-background border-2 border-border flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-3xl font-bold text-text-secondary">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h3 className="text-xl font-semibold text-text-primary truncate">
                {client.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground font-mono">
                  {formatTaxId(client.taxId)}
                </span>
                <button
                  onClick={() => copyToClipboard(client.taxId, "CPF/CNPJ")}
                  className="text-muted-foreground hover:text-text-primary transition-colors cursor-pointer"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={
                  client.status === "active"
                    ? "bg-status-success-muted text-status-success-foreground border-status-success-border"
                    : client.status === "pending"
                      ? "bg-status-warning-muted text-status-warning-foreground border-status-warning-border"
                      : "bg-status-neutral-muted text-status-neutral-foreground border-status-neutral-border"
                }
              >
                {client.status === "active" ? "Ativo" : client.status === "pending" ? "Pendente" : "Inativo"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="bg-background/50"
            onClick={() => window.location.href = `mailto:${client.email}`}
          >
            <Mail className="size-4 mr-2" />
            {client.email}
          </Button>
          {client.phone && (
            <Button
              variant="outline"
              size="sm"
              className="bg-background/50"
              onClick={() => window.open(`https://wa.me/55${client.phone}`, "_blank")}
            >
              <WhatsAppIcon className="size-4 mr-2" />
              {formatPhone(client.phone)}
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="space-y-4">
        {/* Filiação Card */}
        <div className="p-5 rounded-xl border border-border/50 bg-card">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Filiação</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Mãe</p>
              <p className="text-sm font-medium text-text-primary">
                {client.motherName || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pai</p>
              <p className="text-sm font-medium text-text-primary">
                {client.fatherName || "Não informado"}
              </p>
            </div>
          </div>
        </div>

        {/* Estado Civil Card */}
        <div className="p-5 rounded-xl border border-border/50 bg-card">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Estado Civil</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Situação</p>
              <p className="text-sm font-medium text-text-primary">
                {requiresSpouse && client.maritalStatus && client.propertyRegime
                  ? (
                    <>
                      {MARITAL_STATUS_LABELS[client.maritalStatus]}
                      <span className="text-muted-foreground"> | </span>
                      {PROPERTY_REGIME_LABELS[client.propertyRegime]}
                    </>
                  )
                  : client.maritalStatus
                    ? MARITAL_STATUS_LABELS[client.maritalStatus]
                    : "Não informado"}
              </p>
            </div>
            {requiresSpouse && (
              <div>
                <p className="text-xs text-muted-foreground">{dateLabel}</p>
                <p className="text-sm font-medium text-text-primary">
                  {client.weddingDate ? formatDisplayDate(client.weddingDate) : "Não informado"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cônjuge */}
        {spouse && (
          <div
            className="mt-4 mx-2 p-4 rounded-xl border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors group"
            onClick={() => navigate(`/clientes/${spouse._id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-base font-semibold text-primary">
                    {spouse.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cônjuge</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {spouse.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatTaxId(spouse.taxId)}
                  </p>
                </div>
              </div>
              <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
