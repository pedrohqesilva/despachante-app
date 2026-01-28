import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import { getCurrentTimestamp } from "../lib/utils"
import { NotFoundError } from "../lib/errors"
import { propertyDocumentTypeValidator } from "../lib/validators"

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    type: propertyDocumentTypeValidator,
    storageId: v.id("_storage"),
    propertyId: v.id("properties"),
    mimeType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const documentId = await ctx.db.insert("propertyDocuments", {
      name: args.name,
      type: args.type,
      storageId: args.storageId,
      propertyId: args.propertyId,
      mimeType: args.mimeType,
      size: args.size,
      createdAt: getCurrentTimestamp(),
    })

    return documentId
  },
})

export const remove = mutation({
  args: { id: v.id("propertyDocuments") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const document = await ctx.db.get(args.id)
    if (!document) {
      throw new NotFoundError("Documento")
    }

    await ctx.storage.delete(document.storageId)
    await ctx.db.delete(args.id)

    return args.id
  },
})
