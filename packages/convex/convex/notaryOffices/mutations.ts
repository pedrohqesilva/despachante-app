import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import { getCurrentTimestamp } from "../lib/utils"
import { NotFoundError, DuplicateError } from "../lib/errors"
import { notaryOfficeStatusValidator } from "../lib/validators"

export const create = mutation({
  args: {
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
    status: v.optional(notaryOfficeStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const existing = await ctx.db
      .query("notaryOffices")
      .withIndex("code", (q) => q.eq("code", args.code))
      .first()

    if (existing) {
      throw new DuplicateError("Codigo do cartorio")
    }

    const now = getCurrentTimestamp()
    const notaryOfficeId = await ctx.db.insert("notaryOffices", {
      name: args.name,
      code: args.code,
      zipCode: args.zipCode,
      street: args.street,
      number: args.number,
      complement: args.complement,
      neighborhood: args.neighborhood,
      city: args.city,
      state: args.state,
      phone: args.phone,
      email: args.email,
      status: args.status ?? "active",
      updatedAt: now,
    })

    return notaryOfficeId
  },
})

export const update = mutation({
  args: {
    id: v.id("notaryOffices"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    street: v.optional(v.string()),
    number: v.optional(v.string()),
    complement: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(notaryOfficeStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { id, ...updates } = args
    const notaryOffice = await ctx.db.get(id)

    if (!notaryOffice) {
      throw new NotFoundError("Cartorio")
    }

    if (args.code && args.code !== notaryOffice.code) {
      const existing = await ctx.db
        .query("notaryOffices")
        .withIndex("code", (q) => q.eq("code", args.code!))
        .first()

      if (existing) {
        throw new DuplicateError("Codigo do cartorio")
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: getCurrentTimestamp(),
    })

    return { success: true }
  },
})

export const remove = mutation({
  args: { id: v.id("notaryOffices") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    await ctx.db.delete(args.id)
    return { success: true }
  },
})
