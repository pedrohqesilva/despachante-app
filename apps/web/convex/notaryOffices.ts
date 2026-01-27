import { query, mutation } from "./_generated/server"
import { auth } from "./auth"
import { v } from "convex/values"

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const page = args.page ?? 1
    const pageSize = args.pageSize ?? 10
    const skip = (page - 1) * pageSize

    let notaryOffices = await ctx.db.query("notaryOffices").collect()

    if (args.search) {
      const searchLower = args.search.toLowerCase()
      const searchCleaned = args.search.replace(/\D/g, "")
      notaryOffices = notaryOffices.filter(
        (notaryOffice) =>
          notaryOffice.name.toLowerCase().includes(searchLower) ||
          notaryOffice.code.toLowerCase().includes(searchLower) ||
          (notaryOffice.street && notaryOffice.street.toLowerCase().includes(searchLower)) ||
          (notaryOffice.neighborhood && notaryOffice.neighborhood.toLowerCase().includes(searchLower)) ||
          (notaryOffice.city && notaryOffice.city.toLowerCase().includes(searchLower)) ||
          (notaryOffice.state && notaryOffice.state.toLowerCase().includes(searchLower)) ||
          (notaryOffice.zipCode && notaryOffice.zipCode.includes(searchCleaned))
      )
    }

    if (args.status) {
      notaryOffices = notaryOffices.filter((notaryOffice) => notaryOffice.status === args.status)
    }

    if (args.sortBy) {
      const order = args.sortOrder ?? "asc"
      notaryOffices.sort((a, b) => {
        const aValue = a[args.sortBy as keyof typeof a]
        const bValue = b[args.sortBy as keyof typeof b]

        if (aValue === undefined || aValue === null) return 1
        if (bValue === undefined || bValue === null) return -1

        if (typeof aValue === "string" && typeof bValue === "string") {
          return order === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return order === "asc" ? aValue - bValue : bValue - aValue
        }

        return 0
      })
    }

    const total = notaryOffices.length
    const paginated = notaryOffices.slice(skip, skip + pageSize)

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  },
})

export const getById = query({
  args: { id: v.id("notaryOffices") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const notaryOffice = await ctx.db.get(args.id)
    if (!notaryOffice) {
      throw new Error("Notary office not found")
    }

    return notaryOffice
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    zipCode: v.optional(v.string()),
    street: v.optional(v.string()),
    number: v.optional(v.string()),
    complement: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const existing = await ctx.db
      .query("notaryOffices")
      .withIndex("code", (q) => q.eq("code", args.code))
      .first()

    if (existing) {
      throw new Error("Código do cartório já existe")
    }

    const now = Date.now()
    const notaryOfficeId = await ctx.db.insert("notaryOffices", {
      name: args.name,
      code: args.code,
      zipCode: args.zipCode,
      street: args.street,
      number: args.number,
      complement: args.complement,
      neighborhood: args.neighborhood,
      city: args.city,
      state: args.state,
      phone: args.phone,
      email: args.email,
      status: args.status ?? "active",
      createdAt: now,
      updatedAt: now,
    })

    return notaryOfficeId
  },
})

export const update = mutation({
  args: {
    id: v.id("notaryOffices"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    street: v.optional(v.string()),
    number: v.optional(v.string()),
    complement: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const { id, ...updates } = args
    const notaryOffice = await ctx.db.get(id)
    if (!notaryOffice) {
      throw new Error("Notary office not found")
    }

    if (args.code && args.code !== notaryOffice.code) {
      const existing = await ctx.db
        .query("notaryOffices")
        .withIndex("code", (q) => q.eq("code", args.code))
        .first()

      if (existing) {
        throw new Error("Código do cartório já existe")
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

export const remove = mutation({
  args: { id: v.id("notaryOffices") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    await ctx.db.delete(args.id)
    return { success: true }
  },
})
