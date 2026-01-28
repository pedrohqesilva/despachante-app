import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

const documentTypeValidator = v.union(
  v.literal("cpf"),
  v.literal("birth_certificate"),
  v.literal("marriage_certificate"),
  v.literal("identity"),
  v.literal("address_proof"),
  v.literal("other")
);

export const create = mutation({
  args: {
    name: v.string(),
    type: documentTypeValidator,
    storageId: v.id("_storage"),
    clientId: v.id("clients"),
    mimeType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Determina os clientIds (inclui cônjuge se for certidão de casamento)
    const clientIds: string[] = [args.clientId];

    if (args.type === "marriage_certificate") {
      const client = await ctx.db.get(args.clientId);
      if (client?.spouseId) {
        clientIds.push(client.spouseId);
      }
    }

    const documentId = await ctx.db.insert("clientDocuments", {
      name: args.name,
      type: args.type,
      storageId: args.storageId,
      clientIds: clientIds as any,
      mimeType: args.mimeType,
      size: args.size,
      createdAt: Date.now(),
    });

    return documentId;
  },
});

export const get = query({
  args: { id: v.id("clientDocuments") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.get(args.id);
  },
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.getUrl(args.storageId);
  },
});

export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const allDocuments = await ctx.db.query("clientDocuments").collect();

    return allDocuments.filter((doc) => doc.clientIds.includes(args.clientId));
  },
});

export const getMissingRequired = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    const allDocuments = await ctx.db.query("clientDocuments").collect();
    const documents = allDocuments.filter((doc) =>
      doc.clientIds.includes(args.clientId)
    );

    const existingTypes = new Set(documents.map((doc) => doc.type));

    const missing: string[] = [];

    if (!existingTypes.has("cpf")) {
      missing.push("cpf");
    }

    if (!existingTypes.has("birth_certificate")) {
      missing.push("birth_certificate");
    }

    if (!existingTypes.has("address_proof")) {
      missing.push("address_proof");
    }

    const requiresMarriageCertificate =
      client.maritalStatus === "married" ||
      client.maritalStatus === "common_law_marriage";

    if (
      requiresMarriageCertificate &&
      !existingTypes.has("marriage_certificate")
    ) {
      missing.push("marriage_certificate");
    }

    return missing;
  },
});

export const remove = mutation({
  args: { id: v.id("clientDocuments") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    // Remove o arquivo do storage
    await ctx.storage.delete(document.storageId);

    await ctx.db.delete(args.id);
    return args.id;
  },
});
