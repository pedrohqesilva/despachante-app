import { useState } from "react"
import { User, Shield, Palette, Bell, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ProfileSection,
  SecuritySection,
  AppearanceSection,
  NotificationsSection,
  RegistrationsSection,
} from "@/features/settings"

type SettingsSection = "profile" | "security" | "appearance" | "notifications" | "registrations"

const sections = [
  { id: "profile" as const, label: "Perfil", icon: User, description: "Suas informações pessoais" },
  { id: "security" as const, label: "Segurança", icon: Shield, description: "Senha e autenticação" },
  { id: "appearance" as const, label: "Aparência", icon: Palette, description: "Tema e personalização" },
  { id: "notifications" as const, label: "Notificações", icon: Bell, description: "Como você recebe alertas" },
  { id: "registrations" as const, label: "Cadastros", icon: Building2, description: "Dados do sistema" },
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />
      case "security":
        return <SecuritySection />
      case "appearance":
        return <AppearanceSection />
      case "notifications":
        return <NotificationsSection />
      case "registrations":
        return <RegistrationsSection />
      default:
        return null
    }
  }

  const currentSection = sections.find(s => s.id === activeSection)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="border-b  backdrop-blur ">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie sua conta e preferências do sistema.
          </p>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-border/50 shrink-0">
          <nav className="p-4 space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  activeSection === id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className={cn(
                  "size-4",
                  activeSection === id ? "text-primary" : "text-foreground/50"
                )} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-8">
            <div className="mb-8">
              <h2 className="text-lg font-semibold">{currentSection?.label}</h2>
              <p className="text-sm text-muted-foreground">{currentSection?.description}</p>
            </div>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}
