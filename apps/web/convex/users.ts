import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx: any) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return {
      _id: user._id,
      name: user.name ?? "",
      email: user.email ?? "",
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const updates: { name?: string; email?: string } = {};
    
    if (args.name !== undefined) {
      updates.name = args.name;
    }
    
    if (args.email !== undefined) {
      // Check if email already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email))
        .first();
      
      if (existingUser && existingUser._id !== userId) {
        throw new Error("Email already exists");
      }
      
      updates.email = args.email;
    }

    await ctx.db.patch(userId, updates);
    
    return { success: true };
  },
});

export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user || !user.email) {
      throw new Error("User not found");
    }

    // Note: Password change requires validation through the auth provider
    // For now, we'll return an error indicating this feature needs to be implemented
    // via the auth provider's updatePassword method or HTTP endpoint
    throw new Error("Alteração de senha deve ser feita através do fluxo de autenticação. Esta funcionalidade será implementada em breve.");
  },
});
