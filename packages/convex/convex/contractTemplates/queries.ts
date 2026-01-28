import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import {
  getPaginationParams,
  paginateResults,
  sortItems,
} from "../lib/utils"
import { contractTemplateStatusValidator, sortOrderValidator } from "../lib/validators"
import { NotFoundError } from "../lib/errors"
import { filterContractTemplatesBySearch } from "./helpers"

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(contractTemplateStatusValidator),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(sortOrderValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { page, pageSize, skip } = getPaginationParams(args.page, args.pageSize)
    let templates = await ctx.db.query("contractTemplates").collect()

    if (args.search) {
      templates = filterContractTemplatesBySearch(templates, args.search)
    }

    if (args.status) {
      templates = templates.filter((template) => template.status === args.status)
    }

    templates = sortItems(templates, args.sortBy, args.sortOrder)

    return paginateResults(templates, page, pageSize, skip)
  },
})

export const getById = query({
  args: { id: v.id("contractTemplates") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const template = await ctx.db.get(args.id)
    if (!template) {
      throw new NotFoundError("Modelo de contrato")
    }

    return template
  },
})

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx)

    const templates = await ctx.db
      .query("contractTemplates")
      .withIndex("status", (q) => q.eq("status", "active"))
      .collect()

    return templates
  },
})
