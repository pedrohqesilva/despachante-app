import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import {
  getPaginationParams,
  paginateResults,
  sortItems,
} from "../lib/utils"
import { contractStatusValidator, sortOrderValidator } from "../lib/validators"
import { NotFoundError } from "../lib/errors"
import { filterContractsBySearch } from "./helpers"

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(contractStatusValidator),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(sortOrderValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { page, pageSize, skip } = getPaginationParams(args.page, args.pageSize)
    let contracts = await ctx.db.query("contracts").collect()

    if (args.search) {
      contracts = filterContractsBySearch(contracts, args.search)
    }

    if (args.status) {
      contracts = contracts.filter((contract) => contract.status === args.status)
    }

    contracts = sortItems(contracts, args.sortBy, args.sortOrder)

    return paginateResults(contracts, page, pageSize, skip)
  },
})

export const getById = query({
  args: { id: v.id("contracts") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const contract = await ctx.db.get(args.id)
    if (!contract) {
      throw new NotFoundError("Contrato")
    }

    return contract
  },
})

export const listByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const contracts = await ctx.db
      .query("contracts")
      .withIndex("propertyId", (q) => q.eq("propertyId", args.propertyId))
      .collect()

    const contractsWithSize = await Promise.all(
      contracts.map(async (contract) => {
        if (contract.pdfStorageId) {
          const doc = await ctx.db
            .query("propertyDocuments")
            .withIndex("contractId", (q) => q.eq("contractId", contract._id))
            .first()
          return { ...contract, pdfSize: doc?.size }
        }
        return { ...contract, pdfSize: undefined }
      })
    )

    return contractsWithSize.sort((a, b) => b._creationTime - a._creationTime)
  },
})

export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const contracts = await ctx.db
      .query("contracts")
      .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
      .collect()

    const finalizedContracts = contracts.filter(
      (contract) => contract.status === "final" || contract.status === "signed"
    )

    const contractsWithSize = await Promise.all(
      finalizedContracts.map(async (contract) => {
        if (contract.pdfStorageId) {
          const doc = await ctx.db
            .query("propertyDocuments")
            .withIndex("contractId", (q) => q.eq("contractId", contract._id))
            .first()
          return { ...contract, pdfSize: doc?.size }
        }
        return { ...contract, pdfSize: undefined }
      })
    )

    return contractsWithSize.sort((a, b) => b._creationTime - a._creationTime)
  },
})

export const getWithRelations = query({
  args: { id: v.id("contracts") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const contract = await ctx.db.get(args.id)
    if (!contract) {
      throw new NotFoundError("Contrato")
    }

    const [template, property, client, notaryOffice] = await Promise.all([
      contract.templateId ? ctx.db.get(contract.templateId) : null,
      ctx.db.get(contract.propertyId),
      ctx.db.get(contract.clientId),
      contract.notaryOfficeId ? ctx.db.get(contract.notaryOfficeId) : null,
    ])

    return {
      ...contract,
      template,
      property,
      client,
      notaryOffice,
    }
  },
})

export const getPdfUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.storage.getUrl(args.storageId)
  },
})
