import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import { getCurrentTimestamp } from "../lib/utils"
import { NotFoundError, ValidationError } from "../lib/errors"
import { contractStatusValidator } from "../lib/validators"

export const create = mutation({
  args: {
    name: v.string(),
    templateId: v.id("contractTemplates"),
    propertyId: v.id("properties"),
    clientId: v.id("clients"),
    notaryOfficeId: v.optional(v.id("notaryOffices")),
    content: v.string(),
    status: v.optional(contractStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const [template, property, client] = await Promise.all([
      ctx.db.get(args.templateId),
      ctx.db.get(args.propertyId),
      ctx.db.get(args.clientId),
    ])

    if (!template) {
      throw new NotFoundError("Modelo de contrato")
    }
    if (!property) {
      throw new NotFoundError("Imóvel")
    }
    if (!client) {
      throw new NotFoundError("Cliente")
    }

    if (args.notaryOfficeId) {
      const notaryOffice = await ctx.db.get(args.notaryOfficeId)
      if (!notaryOffice) {
        throw new NotFoundError("Cartório")
      }
    }

    const now = getCurrentTimestamp()
    const contractId = await ctx.db.insert("contracts", {
      name: args.name,
      templateId: args.templateId,
      propertyId: args.propertyId,
      clientId: args.clientId,
      notaryOfficeId: args.notaryOfficeId,
      content: args.content,
      status: args.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    })

    return contractId
  },
})

export const update = mutation({
  args: {
    id: v.id("contracts"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.optional(contractStatusValidator),
    notaryOfficeId: v.optional(v.id("notaryOffices")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { id, ...updates } = args
    const contract = await ctx.db.get(id)

    if (!contract) {
      throw new NotFoundError("Contrato")
    }

    if (contract.status === "final" || contract.status === "signed") {
      if (updates.content !== undefined) {
        throw new ValidationError("Não é possível editar o conteúdo de um contrato finalizado")
      }
    }

    if (args.notaryOfficeId) {
      const notaryOffice = await ctx.db.get(args.notaryOfficeId)
      if (!notaryOffice) {
        throw new NotFoundError("Cartório")
      }
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
  args: { id: v.id("contracts") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const contract = await ctx.db.get(args.id)
    if (!contract) {
      throw new NotFoundError("Contrato")
    }

    if (contract.pdfStorageId) {
      await ctx.storage.delete(contract.pdfStorageId)
    }

    const linkedDocument = await ctx.db
      .query("propertyDocuments")
      .withIndex("contractId", (q) => q.eq("contractId", args.id))
      .first()

    if (linkedDocument) {
      await ctx.storage.delete(linkedDocument.storageId)
      await ctx.db.delete(linkedDocument._id)
    }

    await ctx.db.delete(args.id)
    return { success: true }
  },
})

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const updatePdfStorageId = mutation({
  args: {
    id: v.id("contracts"),
    pdfStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const contract = await ctx.db.get(args.id)
    if (!contract) {
      throw new NotFoundError("Contrato")
    }

    if (contract.pdfStorageId) {
      await ctx.storage.delete(contract.pdfStorageId)
    }

    await ctx.db.patch(args.id, {
      pdfStorageId: args.pdfStorageId,
      updatedAt: getCurrentTimestamp(),
    })

    return { success: true }
  },
})

export const createPropertyDocument = mutation({
  args: {
    contractId: v.id("contracts"),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const contract = await ctx.db.get(args.contractId)
    if (!contract) {
      throw new NotFoundError("Contrato")
    }

    const existingDoc = await ctx.db
      .query("propertyDocuments")
      .withIndex("contractId", (q) => q.eq("contractId", args.contractId))
      .first()

    if (existingDoc) {
      await ctx.storage.delete(existingDoc.storageId)
      await ctx.db.patch(existingDoc._id, {
        storageId: args.storageId,
        mimeType: args.mimeType,
        size: args.size,
        createdAt: getCurrentTimestamp(),
      })
      return existingDoc._id
    }

    const docId = await ctx.db.insert("propertyDocuments", {
      name: contract.name,
      type: "contract",
      storageId: args.storageId,
      propertyId: contract.propertyId,
      mimeType: args.mimeType,
      size: args.size,
      createdAt: getCurrentTimestamp(),
      contractId: args.contractId,
    })

    return docId
  },
})
