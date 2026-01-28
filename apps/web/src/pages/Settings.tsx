import { useState } from "react"
import { User, Shield, Palette, Bell, Building2 } from "lucide-react"
import {
  ProfileSection,
  SecuritySection,
  AppearanceSection,
  NotificationsSection,
  RegistrationsSection,
} from "@/features/settings"
import { PageSidebar, type SidebarSection } from "@/components/page-sidebar"

type SettingsSection = "profile" | "security" | "appearance" | "notifications" | "registrations"

const sections: SidebarSection<SettingsSection>[] = [
  { id: "profile", label: "Perfil", icon: User, description: "Suas informações pessoais" },
  { id: "security", label: "Segurança", icon: Shield, description: "Senha e autenticação" },
  { id: "appearance", label: "Aparência", icon: Palette, description: "Tema e personalização" },
  { id: "notifications", label: "Notificações", icon: Bell, description: "Como você recebe alertas" },
  { id: "registrations", label: "Cadastros", icon: Building2, description: "Dados do sistema" },
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
        <PageSidebar
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="flex-1 min-h-0 overflow-auto">
          <div className="max-w-content-max mx-auto p-8">
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
