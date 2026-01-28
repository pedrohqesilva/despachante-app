import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import {
  getPaginationParams,
  paginateResults,
  sortItems,
} from "../lib/utils"
import { notaryOfficeStatusValidator, sortOrderValidator } from "../lib/validators"
import { NotFoundError } from "../lib/errors"
import { filterNotaryOfficesBySearch } from "./helpers"

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(notaryOfficeStatusValidator),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(sortOrderValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { page, pageSize, skip } = getPaginationParams(args.page, args.pageSize)
    let notaryOffices = await ctx.db.query("notaryOffices").collect()

    if (args.search) {
      notaryOffices = filterNotaryOfficesBySearch(notaryOffices, args.search)
    }

    if (args.status) {
      notaryOffices = notaryOffices.filter((office) => office.status === args.status)
    }

    notaryOffices = sortItems(notaryOffices, args.sortBy, args.sortOrder)

    return paginateResults(notaryOffices, page, pageSize, skip)
  },
})

export const getById = query({
  args: { id: v.id("notaryOffices") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const notaryOffice = await ctx.db.get(args.id)
    if (!notaryOffice) {
      throw new NotFoundError("Cartorio")
    }

    return notaryOffice
  },
})
