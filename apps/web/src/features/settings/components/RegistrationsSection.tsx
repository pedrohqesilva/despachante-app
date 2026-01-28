import { useNavigate } from "react-router-dom"
import { Building2, ChevronRight, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export function RegistrationsSection() {
  const navigate = useNavigate()

  const cadastros = [
    {
      id: "cartorios",
      icon: Building2,
      label: "Cartórios",
      description: "Gerencie os cartórios cadastrados no sistema",
      route: "/cadastros/cartorios",
    },
    {
      id: "modelos-contrato",
      icon: FileText,
      label: "Modelos de Contrato",
      description: "Crie e gerencie modelos de contrato com placeholders",
      route: "/cadastros/modelos-contrato",
    },
  ]

  return (
    <div className="space-y-3">
      {cadastros.map(({ id, icon: Icon, label, description, route }) => (
        <button
          key={id}
          type="button"
          onClick={() => navigate(route)}
          className={cn(
            "w-full flex items-center gap-gap p-card min-h-card rounded-xl cursor-pointer",
            "bg-accent/50 border border-border hover:border-primary/30 hover:bg-primary/5",
            "transition-all text-left group"
          )}
        >
          <div className="size-icon-container-md rounded-xl bg-background border border-border flex items-center justify-center shrink-0 transition-colors">
            <Icon className="size-icon-md text-text-tertiary transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary">{label}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="size-icon-md text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </button>
      ))}

      <p className="text-xs text-muted-foreground">
        Gerencie os dados cadastrais utilizados em todo o sistema.
      </p>
    </div>
  )
}
