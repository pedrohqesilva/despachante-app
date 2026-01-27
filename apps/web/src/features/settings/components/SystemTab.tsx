import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function SystemTab() {
  const navigate = useNavigate()

  const cadastros = [
    { 
      id: "cartorios", 
      icon: Building2, 
      label: "Cartórios", 
      description: "Gerenciar cartórios",
      route: "/cadastros/cartorios"
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cadastros</CardTitle>
          <CardDescription>
            Gerencie os cadastros do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cadastros.map(({ id, icon: Icon, label, description, route }) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(route)}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-3",
                  "h-32 w-full rounded-lg border-2 border-border bg-card",
                  "hover:bg-accent hover:border-primary/50 hover:shadow-md",
                  "transition-all duration-200 cursor-pointer",
                  "active:scale-95"
                )}
                title={description}
              >
                <Icon className="size-12 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-foreground leading-tight text-center px-2">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
