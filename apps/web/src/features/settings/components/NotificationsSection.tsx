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
    <div className="space-y-4">
      {/* System Notifications */}
      <div className="flex items-start justify-between gap-4 p-5 rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
        <div className="flex gap-4">
          <div className="size-11 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
            <Bell className="size-5 text-foreground/60" />
          </div>
          <div>
            <p className="font-medium text-foreground">Notificações do sistema</p>
            <p className="text-sm text-muted-foreground mt-1">
              Receba alertas sobre atualizações e informações importantes.
            </p>
          </div>
        </div>
        <Switch
          checked={settings.notifications}
          onCheckedChange={handleNotificationsChange}
        />
      </div>

      {/* Email Notifications */}
      <div className="flex items-start justify-between gap-4 p-5 rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
        <div className="flex gap-4">
          <div className="size-11 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
            <Mail className="size-5 text-foreground/60" />
          </div>
          <div>
            <p className="font-medium text-foreground">Notificações por email</p>
            <p className="text-sm text-muted-foreground mt-1">
              Receba um resumo das notificações diretamente no seu email.
            </p>
          </div>
        </div>
        <Switch
          checked={settings.emailNotifications}
          onCheckedChange={handleEmailNotificationsChange}
        />
      </div>
    </div>
  )
}
