import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { auth } from "../auth"

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Usuário não autenticado")
    }

    const updates: { name?: string; email?: string } = {}

    if (args.name !== undefined) {
      updates.name = args.name.trim()
    }

    if (args.email !== undefined) {
      updates.email = args.email.trim().toLowerCase()
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates)
    }

    return { success: true }
  },
})

export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Usuário não autenticado")
    }

    // Convex Auth gerencia senhas internamente
    // Esta mutation é um placeholder - a mudança de senha
    // deve ser feita através do fluxo de autenticação do Convex Auth
    throw new Error("Alteração de senha deve ser feita através do fluxo de recuperação de senha")
  },
})
