import { Id } from "@despachante/convex/_generated/dataModel"

export type ClientStatus = "active" | "inactive" | "pending"

export type MaritalStatus =
  | "single"
  | "common_law_marriage"
  | "married"
  | "widowed"
  | "divorced"

export type PropertyRegime =
  | "partial_communion"
  | "total_communion"
  | "total_separation"

export type DocumentType =
  | "cpf"
  | "birth_certificate"
  | "marriage_certificate"
  | "identity"
  | "address_proof"
  | "other"

export interface ClientDocument {
  _id: Id<"clientDocuments">
  _creationTime: number
  name: string
  type: DocumentType
  storageId: Id<"_storage">
  clientIds: Id<"clients">[]
  mimeType: string
  size: number
}

export interface Client {
  _id: Id<"clients">
  _creationTime: number
  name: string
  email: string
  phone?: string
  taxId: string
  status: ClientStatus
  maritalStatus?: MaritalStatus
  propertyRegime?: PropertyRegime
  spouseId?: Id<"clients">
  weddingDate?: string
  fatherName?: string
  motherName?: string
  updatedAt: number
}

export interface ClientFilters {
  search?: string
  status?: ClientStatus
}

export interface ClientPagination {
  page: number
  pageSize: number
}

export interface ClientListResponse {
  clients: Client[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
