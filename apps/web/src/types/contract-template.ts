import { Id } from "@despachante/convex/_generated/dataModel"

export type ContractTemplateStatus = "active" | "inactive"

export interface ContractTemplate {
  _id: Id<"contractTemplates">
  name: string
  description?: string
  content: string
  status: ContractTemplateStatus
  createdAt: number
  updatedAt: number
}

export interface PlaceholderGroup {
  category: string
  icon: string
  placeholders: Placeholder[]
}

export interface Placeholder {
  key: string
  label: string
  example: string
}
