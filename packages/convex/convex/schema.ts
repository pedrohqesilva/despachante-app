import { defineSchema, defineTable } from "convex/server"
import { authTables } from "@convex-dev/auth/server"
import { v } from "convex/values"
import {
  clientStatusValidator,
  notaryOfficeStatusValidator,
  propertyStatusValidator,
  maritalStatusValidator,
  propertyRegimeValidator,
  propertyTypeValidator,
  documentTypeValidator,
  propertyDocumentTypeValidator,
} from "./lib/validators"

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  clients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    taxId: v.string(),
    status: clientStatusValidator,
    maritalStatus: v.optional(maritalStatusValidator),
    propertyRegime: v.optional(propertyRegimeValidator),
    spouseId: v.optional(v.id("clients")),
    weddingDate: v.optional(v.string()),
    fatherName: v.optional(v.string()),
    motherName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("email", ["email"])
    .index("status", ["status"])
    .index("taxId", ["taxId"])
    .index("spouseId", ["spouseId"]),

  notaryOffices: defineTable({
    name: v.string(),
    code: v.string(),
    zipCode: v.optional(v.string()),
    street: v.optional(v.string()),
    number: v.optional(v.string()),
    complement: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    status: notaryOfficeStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("code", ["code"])
    .index("status", ["status"]),

  properties: defineTable({
    zipCode: v.string(),
    street: v.string(),
    number: v.string(),
    complement: v.optional(v.string()),
    neighborhood: v.string(),
    city: v.string(),
    state: v.string(),
    type: propertyTypeValidator,
    area: v.number(),
    value: v.number(),
    status: propertyStatusValidator,
    ownerIds: v.array(v.id("clients")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("status", ["status"])
    .index("city", ["city"])
    .index("type", ["type"])
    .index("zipCode", ["zipCode"]),

  clientDocuments: defineTable({
    name: v.string(),
    type: documentTypeValidator,
    storageId: v.id("_storage"),
    clientIds: v.array(v.id("clients")),
    mimeType: v.string(),
    size: v.number(),
    createdAt: v.number(),
  }).index("type", ["type"]),

  propertyDocuments: defineTable({
    name: v.string(),
    type: propertyDocumentTypeValidator,
    storageId: v.id("_storage"),
    propertyId: v.id("properties"),
    mimeType: v.string(),
    size: v.number(),
    createdAt: v.number(),
  })
    .index("type", ["type"])
    .index("propertyId", ["propertyId"]),
})
