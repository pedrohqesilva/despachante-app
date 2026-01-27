import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))),
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

    let clients = await ctx.db.query("clients").collect();

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      const searchCleaned = args.search.replace(/\D/g, "");
      clients = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.taxId.includes(searchLower) ||
          (client.phone && client.phone.replace(/\D/g, "").includes(searchCleaned))
      );
    }

    // Apply status filter
    if (args.status) {
      clients = clients.filter((client) => client.status === args.status);
    }

    // Apply sorting
    if (args.sortBy) {
      const order = args.sortOrder ?? "asc";
      clients.sort((a, b) => {
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

    const total = clients.length;
    const paginatedClients = clients.slice(skip, skip + pageSize);

    return {
      clients: paginatedClients,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
});

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const client = await ctx.db.get(args.id);
    return client;
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
    const clients = await ctx.db.query("clients").collect();

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.taxId.includes(searchLower)
    );
  },
});

export const checkDuplicates = query({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    taxId: v.string(),
    excludeId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const clients = await ctx.db.query("clients").collect();
    const duplicates: {
      name?: boolean;
      email?: boolean;
      phone?: boolean;
      taxId?: boolean;
    } = {};

    const nameLower = args.name.toLowerCase().trim();
    const emailLower = args.email.toLowerCase();
    const phoneCleaned = args.phone?.replace(/\D/g, "");
    const taxIdCleaned = args.taxId.replace(/\D/g, "");

    for (const client of clients) {
      if (args.excludeId && client._id === args.excludeId) {
        continue;
      }

      if (client.name.toLowerCase().trim() === nameLower) {
        duplicates.name = true;
      }

      if (client.email.toLowerCase() === emailLower) {
        duplicates.email = true;
      }

      if (phoneCleaned && client.phone) {
        const clientPhoneCleaned = client.phone.replace(/\D/g, "");
        if (clientPhoneCleaned === phoneCleaned) {
          duplicates.phone = true;
        }
      }

      const clientTaxIdCleaned = client.taxId.replace(/\D/g, "");
      if (clientTaxIdCleaned === taxIdCleaned) {
        duplicates.taxId = true;
      }
    }

    return duplicates;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    taxId: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const clientId = await ctx.db.insert("clients", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      taxId: args.taxId,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });

    return clientId;
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    taxId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))),
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

export const deleteClient = mutation({
  args: {
    id: v.id("clients"),
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
