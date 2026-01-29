import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import { getCurrentTimestamp } from "../lib/utils"
import { NotFoundError } from "../lib/errors"
import {
  clientStatusValidator,
  optionalMaritalStatusValidator,
  optionalPropertyRegimeValidator,
} from "../lib/validators"

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    taxId: v.string(),
    status: clientStatusValidator,
    maritalStatus: optionalMaritalStatusValidator,
    propertyRegime: optionalPropertyRegimeValidator,
    spouseId: v.optional(v.id("clients")),
    fatherName: v.optional(v.string()),
    motherName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const now = getCurrentTimestamp()
    const clientId = await ctx.db.insert("clients", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      taxId: args.taxId,
      status: args.status,
      maritalStatus: args.maritalStatus,
      propertyRegime: args.propertyRegime,
      spouseId: args.spouseId,
      fatherName: args.fatherName,
      motherName: args.motherName,
      updatedAt: now,
    })

    // Vinculo bidirecional com conjuge
    if (args.spouseId) {
      const spouse = await ctx.db.get(args.spouseId)
      if (spouse) {
        if (spouse.spouseId && spouse.spouseId !== clientId) {
          await ctx.db.patch(spouse.spouseId, {
            spouseId: undefined,
            updatedAt: now,
          })
        }
        await ctx.db.patch(args.spouseId, {
          spouseId: clientId,
          maritalStatus: args.maritalStatus,
          propertyRegime: args.propertyRegime,
          updatedAt: now,
        })
      }
    }

    return clientId
  },
})

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    taxId: v.optional(v.string()),
    status: v.optional(clientStatusValidator),
    maritalStatus: optionalMaritalStatusValidator,
    propertyRegime: optionalPropertyRegimeValidator,
    spouseId: v.optional(v.id("clients")),
    removeSpouse: v.optional(v.boolean()),
    weddingDate: v.optional(v.string()),
    fatherName: v.optional(v.string()),
    motherName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { id, removeSpouse, ...updates } = args
    const now = getCurrentTimestamp()

    const currentClient = await ctx.db.get(id)
    if (!currentClient) {
      throw new NotFoundError("Cliente")
    }

    if (removeSpouse && currentClient.spouseId) {
      await ctx.db.patch(currentClient.spouseId, {
        spouseId: undefined,
        updatedAt: now,
      })
      updates.spouseId = undefined
    } else if (args.spouseId && args.spouseId !== currentClient.spouseId) {
      if (currentClient.spouseId) {
        await ctx.db.patch(currentClient.spouseId, {
          spouseId: undefined,
          updatedAt: now,
        })
      }

      const newSpouse = await ctx.db.get(args.spouseId)
      if (newSpouse) {
        if (newSpouse.spouseId && newSpouse.spouseId !== id) {
          await ctx.db.patch(newSpouse.spouseId, {
            spouseId: undefined,
            updatedAt: now,
          })
        }
        await ctx.db.patch(args.spouseId, {
          spouseId: id,
          maritalStatus: args.maritalStatus || currentClient.maritalStatus,
          propertyRegime: args.propertyRegime || currentClient.propertyRegime,
          weddingDate: args.weddingDate || currentClient.weddingDate,
          updatedAt: now,
        })
      }
    } else if (
      currentClient.spouseId &&
      (args.maritalStatus || args.propertyRegime || args.weddingDate)
    ) {
      // Sincroniza dados com conjuge existente
      await ctx.db.patch(currentClient.spouseId, {
        maritalStatus: args.maritalStatus || currentClient.maritalStatus,
        propertyRegime: args.propertyRegime || currentClient.propertyRegime,
        weddingDate: args.weddingDate || currentClient.weddingDate,
        updatedAt: now,
      })
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    })

    return id
  },
})

export const deleteClient = mutation({
  args: {
    id: v.id("clients"),
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
