// Components
export { OverviewSection } from "./components/OverviewSection"
export { PropertiesSection } from "./components/PropertiesSection"
export { DocumentsSection } from "./components/DocumentsSection"
export { ClientDialog } from "./components/ClientDialog"
export { ClientFormFields } from "./components/ClientFormFields"
export { MaritalStatusSelector } from "./components/MaritalStatusSelector"
export { SpouseSelector } from "./components/SpouseSelector"
export { CreateSpouseDialog } from "./components/CreateSpouseDialog"
export { ClientsTableActions } from "./components/ClientsTableActions"
export { ExportButton } from "./components/ExportButton"

// Hooks
export { useClientForm } from "./hooks/useClientForm"
export { useSpouseForm } from "./hooks/useSpouseForm"

// Types
export type { ClientFormData, ClientFormErrors, ClientSubmitData } from "./hooks/useClientForm"
export type { SpouseFormData } from "./hooks/useSpouseForm"
export type { ClientDialogSaveData } from "./components/ClientDialog"
