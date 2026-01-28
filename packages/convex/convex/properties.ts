import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))),
    type: v.optional(v.union(v.literal("house"), v.literal("apartment"), v.literal("land"), v.literal("building"))),
    city: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    let properties = await ctx.db.query("properties").collect();

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      const searchCleaned = args.search.replace(/\D/g, "");
      properties = properties.filter(
        (property) =>
          property.street.toLowerCase().includes(searchLower) ||
          property.neighborhood.toLowerCase().includes(searchLower) ||
          property.city.toLowerCase().includes(searchLower) ||
          property.zipCode.includes(searchCleaned) ||
          property.state.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (args.status) {
      properties = properties.filter((property) => property.status === args.status);
    }

    // Apply type filter
    if (args.type) {
      properties = properties.filter((property) => property.type === args.type);
    }

    // Apply city filter
    if (args.city) {
      const cityLower = args.city.toLowerCase();
      properties = properties.filter((property) => property.city.toLowerCase().includes(cityLower));
    }

    // Apply sorting
    if (args.sortBy) {
      const order = args.sortOrder ?? "asc";
      properties.sort((a, b) => {
        const aValue = a[args.sortBy as keyof typeof a];
        const bValue = b[args.sortBy as keyof typeof b];

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return order === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return order === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    const total = properties.length;
    const paginatedProperties = properties.slice(skip, skip + pageSize);

    return {
      properties: paginatedProperties,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
});

export const get = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const property = await ctx.db.get(args.id);
    return property;
  },
});

export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const searchLower = args.query.toLowerCase();
    const searchCleaned = args.query.replace(/\D/g, "");
    const properties = await ctx.db.query("properties").collect();

    return properties.filter(
      (property) =>
        property.street.toLowerCase().includes(searchLower) ||
        property.neighborhood.toLowerCase().includes(searchLower) ||
        property.city.toLowerCase().includes(searchLower) ||
        property.zipCode.includes(searchCleaned) ||
        property.state.toLowerCase().includes(searchLower)
    );
  },
});

export const checkDuplicates = query({
  args: {
    street: v.string(),
    number: v.string(),
    zipCode: v.string(),
    excludeId: v.optional(v.id("properties")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const properties = await ctx.db.query("properties").collect();
    const zipCodeCleaned = args.zipCode.replace(/\D/g, "");
    const streetLower = args.street.toLowerCase().trim();
    const numberLower = args.number.toLowerCase().trim();

    for (const property of properties) {
      if (args.excludeId && property._id === args.excludeId) {
        continue;
      }

      const propertyZipCodeCleaned = property.zipCode.replace(/\D/g, "");
      if (
        property.street.toLowerCase().trim() === streetLower &&
        property.number.toLowerCase().trim() === numberLower &&
        propertyZipCodeCleaned === zipCodeCleaned
      ) {
        return { duplicate: true };
      }
    }

    return { duplicate: false };
  },
});

export const create = mutation({
  args: {
    zipCode: v.string(),
    street: v.string(),
    number: v.string(),
    complement: v.optional(v.string()),
    neighborhood: v.string(),
    city: v.string(),
    state: v.string(),
    type: v.union(v.literal("house"), v.literal("apartment"), v.literal("land"), v.literal("building")),
    area: v.number(),
    value: v.number(),
    ownerIds: v.array(v.id("clients")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const propertyId = await ctx.db.insert("properties", {
      zipCode: args.zipCode,
      street: args.street,
      number: args.number,
      complement: args.complement,
      neighborhood: args.neighborhood,
      city: args.city,
      state: args.state,
      type: args.type,
      area: args.area,
      value: args.value,
      status: "active",
      ownerIds: args.ownerIds,
      createdAt: now,
      updatedAt: now,
    });

    return propertyId;
  },
});

export const update = mutation({
  args: {
    id: v.id("properties"),
    zipCode: v.optional(v.string()),
    street: v.optional(v.string()),
    number: v.optional(v.string()),
    complement: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    type: v.optional(v.union(v.literal("house"), v.literal("apartment"), v.literal("land"), v.literal("building"))),
    area: v.optional(v.number()),
    value: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))),
    ownerIds: v.optional(v.array(v.id("clients"))),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const deleteProperty = mutation({
  args: {
    id: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Soft delete by setting status to inactive
    await ctx.db.patch(args.id, {
      status: "inactive",
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const listByClient = query({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const properties = await ctx.db.query("properties").collect();

    return properties.filter(
      (property) =>
        property.status !== "inactive" &&
        property.ownerIds.includes(args.clientId)
    );
  },
});
