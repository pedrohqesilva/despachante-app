import { Id } from "@despachante/convex/_generated/dataModel"

export type ContractStatus = "draft" | "final" | "signed"

export interface Contract {
  _id: Id<"contracts">
  name: string
  templateId: Id<"contractTemplates">
  propertyId: Id<"properties">
  clientId: Id<"clients">
  notaryOfficeId?: Id<"notaryOffices">
  content: string
  status: ContractStatus
  pdfStorageId?: Id<"_storage">
  createdAt: number
  updatedAt: number
}

export interface ContractWithRelations extends Contract {
  template: {
    _id: Id<"contractTemplates">
    name: string
  } | null
  property: {
    _id: Id<"properties">
    street: string
    number: string
    city: string
    state: string
  } | null
  client: {
    _id: Id<"clients">
    name: string
    email: string
  } | null
  notaryOffice: {
    _id: Id<"notaryOffices">
    name: string
    code: string
  } | null
}
