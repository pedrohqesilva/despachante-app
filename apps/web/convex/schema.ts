import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

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
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("pending")
    ),
    maritalStatus: v.optional(
      v.union(
        v.literal("single"),
        v.literal("common_law_marriage"),
        v.literal("married"),
        v.literal("widowed"),
        v.literal("divorced")
      )
    ),
    propertyRegime: v.optional(
      v.union(
        v.literal("partial_communion"),
        v.literal("total_communion"),
        v.literal("total_separation")
      )
    ),
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
    status: v.union(
      v.literal("active"),
      v.literal("inactive")
    ),
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
    type: v.union(
      v.literal("house"),
      v.literal("apartment"),
      v.literal("land"),
      v.literal("building")
    ),
    area: v.number(),
    value: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("pending")
    ),
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
    type: v.union(
      v.literal("cpf"),
      v.literal("birth_certificate"),
      v.literal("marriage_certificate"),
      v.literal("identity"),
      v.literal("address_proof"),
      v.literal("other")
    ),
    storageId: v.id("_storage"),
    clientIds: v.array(v.id("clients")),
    mimeType: v.string(),
    size: v.number(),
    createdAt: v.number(),
  })
    .index("type", ["type"]),
});
