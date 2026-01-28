import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"

export const get = query({
  args: { id: v.id("propertyDocuments") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.get(args.id)
  },
})

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.storage.getUrl(args.storageId)
  },
})

export const listByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db
      .query("propertyDocuments")
      .withIndex("propertyId", (q) => q.eq("propertyId", args.propertyId))
      .collect()
  },
})
