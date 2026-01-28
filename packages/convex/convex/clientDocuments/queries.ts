import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import { NotFoundError } from "../lib/errors"
import { getMissingRequiredDocuments } from "./helpers"

export const get = query({
  args: { id: v.id("clientDocuments") },
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

export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const allDocuments = await ctx.db.query("clientDocuments").collect()
    return allDocuments.filter((doc) => doc.clientIds.includes(args.clientId))
  },
})

export const getMissingRequired = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const client = await ctx.db.get(args.clientId)
    if (!client) {
      throw new NotFoundError("Cliente")
    }

    const allDocuments = await ctx.db.query("clientDocuments").collect()
    const clientDocuments = allDocuments.filter((doc) =>
      doc.clientIds.includes(args.clientId)
    )

    return getMissingRequiredDocuments(clientDocuments, client)
  },
})
