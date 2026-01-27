import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Bell, Mail } from "lucide-react"
import { settingsService } from "../services/settings.service"
import { toast } from "sonner"
import type { SystemSettings } from "../types/settings.types"

export function NotificationsSection() {
  const [settings, setSettings] = useState<SystemSettings>(() =>
    settingsService.getSystemSettings()
  )

  const handleNotificationsChange = (checked: boolean) => {
    const updated = { ...settings, notifications: checked }
    setSettings(updated)
    settingsService.updateSystemSettings(updated)
    toast.success(checked ? "Notificações ativadas" : "Notificações desativadas")
  }

  const handleEmailNotificationsChange = (checked: boolean) => {
    const updated = { ...settings, emailNotifications: checked }
    setSettings(updated)
    settingsService.updateSystemSettings(updated)
    toast.success(checked ? "Notificações por email ativadas" : "Notificações por email desativadas")
  }

  return (
    <div className="space-y-3">
      {/* System Notifications */}
      <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
        <div className="size-icon-container-md rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
          <Bell className="size-icon-md text-text-tertiary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary">Notificações do sistema</p>
          <p className="text-sm text-muted-foreground">
            Receba alertas sobre atualizações e informações importantes.
          </p>
        </div>
        <Switch
          checked={settings.notifications}
          onCheckedChange={handleNotificationsChange}
          className="shrink-0"
        />
      </div>

      {/* Email Notifications */}
      <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
        <div className="size-icon-container-md rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
          <Mail className="size-icon-md text-text-tertiary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary">Notificações por email</p>
          <p className="text-sm text-muted-foreground">
            Receba um resumo das notificações diretamente no seu email.
          </p>
        </div>
        <Switch
          checked={settings.emailNotifications}
          onCheckedChange={handleEmailNotificationsChange}
          className="shrink-0"
        />
      </div>
    </div>
  )
}
