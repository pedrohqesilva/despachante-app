import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import { getCurrentTimestamp } from "../lib/utils"
import { NotFoundError } from "../lib/errors"
import { documentTypeValidator } from "../lib/validators"
import type { Id } from "../_generated/dataModel"

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
    type: documentTypeValidator,
    storageId: v.id("_storage"),
    clientId: v.id("clients"),
    mimeType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const clientIds: Id<"clients">[] = [args.clientId]

    // Certidao de casamento eh vinculada ao conjuge tambem
    if (args.type === "marriage_certificate") {
      const client = await ctx.db.get(args.clientId)
      if (client?.spouseId) {
        clientIds.push(client.spouseId)
      }
    }

    const documentId = await ctx.db.insert("clientDocuments", {
      name: args.name,
      type: args.type,
      storageId: args.storageId,
      clientIds,
      mimeType: args.mimeType,
      size: args.size,
      createdAt: getCurrentTimestamp(),
    })

    return documentId
  },
})

export const remove = mutation({
  args: { id: v.id("clientDocuments") },
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
