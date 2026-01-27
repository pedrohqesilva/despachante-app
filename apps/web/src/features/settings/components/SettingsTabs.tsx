import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountTab } from "./AccountTab"
import { SystemTab } from "./SystemTab"

export function SettingsTabs() {
  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Conta</TabsTrigger>
        <TabsTrigger value="system">Sistema</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountTab />
      </TabsContent>

      <TabsContent value="system">
        <SystemTab />
      </TabsContent>
    </Tabs>
  )
}
