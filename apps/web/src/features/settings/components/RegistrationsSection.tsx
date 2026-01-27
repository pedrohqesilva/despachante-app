import { useNavigate } from "react-router-dom"
import { Building2, ChevronRight } from "lucide-react"
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
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {cadastros.map(({ id, icon: Icon, label, description, route }) => (
          <button
            key={id}
            type="button"
            onClick={() => navigate(route)}
            className={cn(
              "w-full flex items-center gap-4 p-5 rounded-xl cursor-pointer",
              "bg-accent/50 border border-transparent hover:border-primary/30 hover:bg-primary/5",
              "transition-all text-left group"
            )}
          >
            <div className="size-11 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
              <Icon className="size-5 text-foreground/60 group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Gerencie os dados cadastrais utilizados em todo o sistema.
      </p>
    </div>
  )
}
