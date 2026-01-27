import { SettingsTabs } from "@/features/settings"
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/page-header"

export default function Settings() {
  return (
    <div className="flex-1 flex flex-col">
      <PageHeader>
        <div>
          <PageHeaderHeading>Configurações</PageHeaderHeading>
          <PageHeaderDescription>
            Gerencie suas configurações de conta, preferências do sistema e personalização.
          </PageHeaderDescription>
        </div>
      </PageHeader>

      <div className="flex-1 space-y-4">
        <SettingsTabs />
      </div>
    </div>
  )
}
