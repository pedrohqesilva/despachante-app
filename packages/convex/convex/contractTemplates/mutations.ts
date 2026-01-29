import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import { getCurrentTimestamp } from "../lib/utils"
import { NotFoundError } from "../lib/errors"
import { contractTemplateStatusValidator } from "../lib/validators"

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    status: v.optional(contractTemplateStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const now = getCurrentTimestamp()
    const templateId = await ctx.db.insert("contractTemplates", {
      name: args.name,
      description: args.description,
      content: args.content,
      status: args.status ?? "active",
      updatedAt: now,
    })

    return templateId
  },
})

export const update = mutation({
  args: {
    id: v.id("contractTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.optional(contractTemplateStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { id, ...updates } = args
    const template = await ctx.db.get(id)

    if (!template) {
      throw new NotFoundError("Modelo de contrato")
    }

    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    )

    await ctx.db.patch(id, {
      ...cleanedUpdates,
      updatedAt: getCurrentTimestamp(),
    })

    return { success: true }
  },
})

export const remove = mutation({
  args: { id: v.id("contractTemplates") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const template = await ctx.db.get(args.id)
    if (!template) {
      throw new NotFoundError("Modelo de contrato")
    }

    const contractsUsingTemplate = await ctx.db
      .query("contracts")
      .withIndex("templateId", (q) => q.eq("templateId", args.id))
      .first()

    if (contractsUsingTemplate) {
      await ctx.db.patch(args.id, {
        status: "inactive",
        updatedAt: getCurrentTimestamp(),
      })
      return { success: true, softDeleted: true }
    }

    await ctx.db.delete(args.id)
    return { success: true, softDeleted: false }
  },
})
