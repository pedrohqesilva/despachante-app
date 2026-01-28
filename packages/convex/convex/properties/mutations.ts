import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import { getCurrentTimestamp } from "../lib/utils"
import { propertyStatusValidator, propertyTypeValidator } from "../lib/validators"

export const create = mutation({
  args: {
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
    ownerIds: v.array(v.id("clients")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const now = getCurrentTimestamp()
    const propertyId = await ctx.db.insert("properties", {
      zipCode: args.zipCode,
      street: args.street,
      number: args.number,
      complement: args.complement,
      neighborhood: args.neighborhood,
      city: args.city,
      state: args.state,
      type: args.type,
      area: args.area,
      value: args.value,
      status: "active",
      ownerIds: args.ownerIds,
      createdAt: now,
      updatedAt: now,
    })

    return propertyId
  },
})

export const update = mutation({
  args: {
    id: v.id("properties"),
    zipCode: v.optional(v.string()),
    street: v.optional(v.string()),
    number: v.optional(v.string()),
    complement: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    type: v.optional(propertyTypeValidator),
    area: v.optional(v.number()),
    value: v.optional(v.number()),
    status: v.optional(propertyStatusValidator),
    ownerIds: v.optional(v.array(v.id("clients"))),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: getCurrentTimestamp(),
    })

    return id
  },
})

export const deleteProperty = mutation({
  args: {
    id: v.id("properties"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    await ctx.db.patch(args.id, {
      status: "inactive",
      updatedAt: getCurrentTimestamp(),
    })

    return args.id
  },
})
