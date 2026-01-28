import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireAuth } from "../lib/auth"
import {
  getPaginationParams,
  paginateResults,
  sortItems,
  normalizeForSearch,
} from "../lib/utils"
import {
  propertyStatusValidator,
  propertyTypeValidator,
  sortOrderValidator,
} from "../lib/validators"
import { filterPropertiesBySearch, checkPropertyDuplicate } from "./helpers"

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(propertyStatusValidator),
    type: v.optional(propertyTypeValidator),
    city: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(sortOrderValidator),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const { page, pageSize, skip } = getPaginationParams(args.page, args.pageSize)
    let properties = await ctx.db.query("properties").collect()

    if (args.search) {
      properties = filterPropertiesBySearch(properties, args.search)
    }

    if (args.status) {
      properties = properties.filter((property) => property.status === args.status)
    }

    if (args.type) {
      properties = properties.filter((property) => property.type === args.type)
    }

    if (args.city) {
      const cityLower = normalizeForSearch(args.city)
      properties = properties.filter((property) =>
        property.city.toLowerCase().includes(cityLower)
      )
    }

    properties = sortItems(properties, args.sortBy, args.sortOrder)

    const result = paginateResults(properties, page, pageSize, skip)

    return {
      properties: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    }
  },
})

export const get = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.get(args.id)
  },
})

export const getWithOwners = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const property = await ctx.db.get(args.id)
    if (!property) {
      return null
    }

    const owners = await Promise.all(
      property.ownerIds.map((ownerId) => ctx.db.get(ownerId))
    )

    const validOwners = owners.filter(
      (owner): owner is NonNullable<typeof owner> => owner !== null
    )

    return {
      ...property,
      owners: validOwners,
    }
  },
})

export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const properties = await ctx.db.query("properties").collect()
    return filterPropertiesBySearch(properties, args.query)
  },
})

export const checkDuplicates = query({
  args: {
    street: v.string(),
    number: v.string(),
    zipCode: v.string(),
    excludeId: v.optional(v.id("properties")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const properties = await ctx.db.query("properties").collect()
    const duplicate = checkPropertyDuplicate(
      properties,
      {
        street: args.street,
        number: args.number,
        zipCode: args.zipCode,
      },
      args.excludeId
    )

    return { duplicate }
  },
})

export const listByClient = query({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx)

    const properties = await ctx.db.query("properties").collect()

    return properties.filter(
      (property) =>
        property.status !== "inactive" &&
        property.ownerIds.includes(args.clientId)
    )
  },
})
