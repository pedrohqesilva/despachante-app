import { useState } from "react"
import { settingsService } from "../services/settings.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { UserPreferences } from "../types/settings.types"

const TIMEZONES = [
  "America/Sao_Paulo",
  "America/Manaus",
  "America/Fortaleza",
  "America/Recife",
  "America/Belem",
  "America/Cuiaba",
  "America/Campo_Grande",
  "America/Araguaina",
  "America/Maceio",
  "America/Bahia",
  "America/Santarem",
  "America/Boa_Vista",
  "America/Rio_Branco",
  "America/Noronha",
]

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/AAAA" },
  { value: "MM/DD/YYYY", label: "MM/DD/AAAA" },
  { value: "YYYY-MM-DD", label: "AAAA-MM-DD" },
]

export function PreferencesTab() {
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    settingsService.getUserPreferences()
  )

  const handleLanguageChange = (value: string) => {
    const updated = { ...preferences, language: value as UserPreferences["language"] }
    setPreferences(updated)
    settingsService.updateUserPreferences(updated)
    toast.success("Idioma atualizado")
  }

  const handleTimezoneChange = (value: string) => {
    const updated = { ...preferences, timezone: value }
    setPreferences(updated)
    settingsService.updateUserPreferences(updated)
    toast.success("Fuso horário atualizado")
  }

  const handleDateFormatChange = (value: string) => {
    const updated = { ...preferences, dateFormat: value }
    setPreferences(updated)
    settingsService.updateUserPreferences(updated)
    toast.success("Formato de data atualizado")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferências Regionais</CardTitle>
          <CardDescription>
            Configure idioma, fuso horário e formato de data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select value={preferences.language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select value={preferences.timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Formato de Data</Label>
            <Select value={preferences.dateFormat} onValueChange={handleDateFormatChange}>
              <SelectTrigger id="dateFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
