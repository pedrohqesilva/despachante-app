import { useState } from "react"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { settingsService } from "../services/settings.service"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { SystemSettings } from "../types/settings.types"

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<SystemSettings>(() =>
    settingsService.getSystemSettings()
  )

  // Calculate theme during render instead of syncing in useEffect
  const currentTheme = (theme as SystemSettings["theme"]) || settings.theme

  const handleThemeChange = (value: SystemSettings["theme"]) => {
    setTheme(value)
    const updated = { ...settings, theme: value }
    setSettings(updated)
    settingsService.updateSystemSettings(updated)
    toast.success("Tema atualizado")
  }

  const themes = [
    {
      value: "light" as const,
      icon: Sun,
      label: "Claro",
      description: "Tema claro para ambientes bem iluminados",
    },
    {
      value: "dark" as const,
      icon: Moon,
      label: "Escuro",
      description: "Tema escuro para reduzir o cansaço visual",
    },
    {
      value: "system" as const,
      icon: Monitor,
      label: "Sistema",
      description: "Segue a configuração do seu dispositivo",
    },
  ]

  return (
    <div className="space-y-3">
      {themes.map(({ value, icon: Icon, label, description }) => {
        const isSelected = currentTheme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleThemeChange(value)}
            className={cn(
              "w-full flex items-center gap-gap p-card min-h-card rounded-xl text-left transition-all cursor-pointer",
              isSelected
                ? "border-2 border-primary bg-primary/10 shadow-sm"
                : "border border-border bg-accent/50 hover:bg-accent hover:border-border"
            )}
          >
            <div
              className={cn(
                "size-icon-container-md rounded-xl flex items-center justify-center shrink-0 transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background border border-border text-text-tertiary"
              )}
            >
              <Icon className="size-icon-md" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium",
                isSelected ? "text-text-primary" : "text-text-secondary"
              )}>{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {isSelected && (
              <div className="size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="size-4 text-primary-foreground" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
