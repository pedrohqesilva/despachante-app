import { v } from "convex/values"

// Status validators
export const clientStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("pending")
)

export const notaryOfficeStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive")
)

export const propertyStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("pending")
)

// Marital status validators
export const maritalStatusValidator = v.union(
  v.literal("single"),
  v.literal("common_law_marriage"),
  v.literal("married"),
  v.literal("widowed"),
  v.literal("divorced")
)

export const optionalMaritalStatusValidator = v.optional(maritalStatusValidator)

// Property regime validators
export const propertyRegimeValidator = v.union(
  v.literal("partial_communion"),
  v.literal("total_communion"),
  v.literal("total_separation")
)

export const optionalPropertyRegimeValidator = v.optional(propertyRegimeValidator)

// Property type validators
export const propertyTypeValidator = v.union(
  v.literal("house"),
  v.literal("apartment"),
  v.literal("land"),
  v.literal("building")
)

// Document type validators (client documents)
export const documentTypeValidator = v.union(
  v.literal("cpf"),
  v.literal("birth_certificate"),
  v.literal("marriage_certificate"),
  v.literal("identity"),
  v.literal("address_proof"),
  v.literal("other")
)

// Property document type validators
export const propertyDocumentTypeValidator = v.union(
  v.literal("deed"),
  v.literal("registration"),
  v.literal("property_tax"),
  v.literal("lien_certificate"),
  v.literal("blueprint"),
  v.literal("other")
)

// Sort order validator
export const sortOrderValidator = v.union(v.literal("asc"), v.literal("desc"))

// Types extraidos dos validators
export type ClientStatus = "active" | "inactive" | "pending"
export type NotaryOfficeStatus = "active" | "inactive"
export type PropertyStatus = "active" | "inactive" | "pending"
export type MaritalStatus = "single" | "common_law_marriage" | "married" | "widowed" | "divorced"
export type PropertyRegime = "partial_communion" | "total_communion" | "total_separation"
export type PropertyType = "house" | "apartment" | "land" | "building"
export type DocumentType = "cpf" | "birth_certificate" | "marriage_certificate" | "identity" | "address_proof" | "other"
export type PropertyDocumentType = "deed" | "registration" | "property_tax" | "lien_certificate" | "blueprint" | "other"
export type SortOrder = "asc" | "desc"
