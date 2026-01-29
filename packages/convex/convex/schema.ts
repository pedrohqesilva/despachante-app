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
  contractTemplateStatusValidator,
  contractStatusValidator,
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
  }).index("type", ["type"]),

  propertyDocuments: defineTable({
    name: v.string(),
    type: propertyDocumentTypeValidator,
    storageId: v.id("_storage"),
    propertyId: v.id("properties"),
    mimeType: v.string(),
    size: v.number(),
    contractId: v.optional(v.id("contracts")),
  })
    .index("type", ["type"])
    .index("propertyId", ["propertyId"])
    .index("contractId", ["contractId"]),

  contractTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    status: contractTemplateStatusValidator,
    updatedAt: v.number(),
  }).index("status", ["status"]),

  contracts: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    templateId: v.optional(v.id("contractTemplates")),
    propertyId: v.id("properties"),
    clientId: v.id("clients"),
    notaryOfficeId: v.optional(v.id("notaryOffices")),
    content: v.string(),
    status: contractStatusValidator,
    pdfStorageId: v.optional(v.id("_storage")),
    updatedAt: v.number(),
  })
    .index("propertyId", ["propertyId"])
    .index("clientId", ["clientId"])
    .index("templateId", ["templateId"])
    .index("status", ["status"]),
})
