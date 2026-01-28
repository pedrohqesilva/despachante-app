import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import {
  getPaginationParams,
  paginateResults,
  sortItems,
} from "../lib/utils"
import { clientStatusValidator, sortOrderValidator } from "../lib/validators"
import { filterClientsBySearch, checkClientDuplicates } from "./helpers"

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(clientStatusValidator),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(sortOrderValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { page, pageSize, skip } = getPaginationParams(args.page, args.pageSize)
    let clients = await ctx.db.query("clients").collect()

    if (args.search) {
      clients = filterClientsBySearch(clients, args.search)
    }

    if (args.status) {
      clients = clients.filter((client) => client.status === args.status)
    }

    clients = sortItems(clients, args.sortBy, args.sortOrder)

    const result = paginateResults(clients, page, pageSize, skip)

    return {
      clients: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    }
  },
})

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.get(args.id)
  },
})

export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const clients = await ctx.db.query("clients").collect()
    return filterClientsBySearch(clients, args.query)
  },
})

export const checkDuplicates = query({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    taxId: v.string(),
    excludeId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const clients = await ctx.db.query("clients").collect()

    return checkClientDuplicates(
      clients,
      {
        name: args.name,
        email: args.email,
        phone: args.phone,
        taxId: args.taxId,
      },
      args.excludeId
    )
  },
})

export const searchExcluding = query({
  args: {
    query: v.optional(v.string()),
    excludeId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const clients = await ctx.db.query("clients").collect()

    let filtered = clients.filter(
      (client) =>
        client._id !== args.excludeId && client.status !== "inactive"
    )

    if (args.query && args.query.trim().length > 0) {
      filtered = filterClientsBySearch(filtered, args.query)
      return filtered.slice(0, 10)
    }

    return filtered
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 20)
  },
})

export const getByIds = query({
  args: {
    ids: v.array(v.id("clients")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const clients = await Promise.all(args.ids.map((id) => ctx.db.get(id)))

    return clients.filter(
      (client): client is NonNullable<typeof client> => client !== null
    )
  },
})
