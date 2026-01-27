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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("email", ["email"])
    .index("status", ["status"])
    .index("taxId", ["taxId"]),
  notaryOffices: defineTable({
    name: v.string(),
    code: v.string(),
    address: v.optional(v.string()),
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
});
