import { Id } from "@despachante/convex/_generated/dataModel"

export type PropertyType = "house" | "apartment" | "land" | "building"
export type PropertyStatus = "active" | "inactive" | "pending"
export type PropertyDocumentType =
  | "deed"
  | "registration"
  | "property_tax"
  | "lien_certificate"
  | "blueprint"
  | "other"

export interface Property {
  _id: Id<"properties">
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  type: PropertyType
  area: number
  value: number
  status: PropertyStatus
  ownerIds: Id<"clients">[]
  createdAt: number
  updatedAt: number
}

export interface PropertyFilters {
  search?: string
  status?: PropertyStatus
  type?: PropertyType
  city?: string
}

export interface PropertyPagination {
  page: number
  pageSize: number
}

export interface PropertyListResponse {
  properties: Property[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PropertyDocument {
  _id: Id<"propertyDocuments">
  name: string
  type: PropertyDocumentType
  storageId: Id<"_storage">
  propertyId: Id<"properties">
  mimeType: string
  size: number
  createdAt: number
}
