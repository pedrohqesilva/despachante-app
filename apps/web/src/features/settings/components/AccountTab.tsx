import { useState } from "react"
import { ProfileForm } from "./ProfileForm"
import { ChangePasswordDialog } from "./ChangePasswordDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Key, Sun, Moon, Monitor } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "@/contexts/ThemeContext"
import { settingsService } from "../services/settings.service"
import { cn } from "@/lib/utils"
import type { SystemSettings } from "../types/settings.types"

export function AccountTab() {
  const { theme, setTheme } = useTheme()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>(() =>
    settingsService.getSystemSettings()
  )

  // Calculate theme during render instead of syncing in useEffect
  const currentSettings: SystemSettings = {
    ...settings,
    theme: (theme as SystemSettings["theme"]) || settings.theme,
  }

  const handleThemeChange = (value: SystemSettings["theme"]) => {
    setTheme(value)
    const updated = { ...settings, theme: value }
    setSettings(updated)
    settingsService.updateSystemSettings(updated)
    toast.success("Tema atualizado")
  }

  const handleNotificationsChange = (checked: boolean) => {
    const updated = { ...settings, notifications: checked }
    setSettings(updated)
    settingsService.updateSystemSettings(updated)
    toast.success("Configurações de notificações atualizadas")
  }

  const handleEmailNotificationsChange = (checked: boolean) => {
    const updated = { ...settings, emailNotifications: checked }
    setSettings(updated)
    settingsService.updateSystemSettings(updated)
    toast.success("Configurações de email atualizadas")
  }

  const themes = [
    { value: "light" as const, icon: Sun, label: "Claro" },
    { value: "dark" as const, icon: Moon, label: "Escuro" },
    { value: "system" as const, icon: Monitor, label: "Sistema" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e de contato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Gerencie sua senha e configurações de segurança.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Senha</p>
                <p className="text-sm text-muted-foreground">
                  Altere sua senha para manter sua conta segura
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                <Key className="mr-2 size-4" />
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Personalize a aparência do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <div className="flex gap-2">
              {themes.map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={currentSettings.theme === value ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleThemeChange(value)}
                  className={cn(
                    "h-10 w-10",
                    currentSettings.theme === value && "bg-primary text-primary-foreground"
                  )}
                  title={label}
                >
                  <Icon className="size-4" />
                  <span className="sr-only">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notificações</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações do sistema
              </p>
            </div>
            <Switch
              id="notifications"
              checked={currentSettings.notifications}
              onCheckedChange={handleNotificationsChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações por email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={currentSettings.emailNotifications}
              onCheckedChange={handleEmailNotificationsChange}
            />
          </div>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </div>
  )
}
