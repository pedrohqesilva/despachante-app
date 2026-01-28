import type { QueryCtx, MutationCtx } from "../_generated/server"
import { auth } from "../auth"
import { AuthenticationError } from "./errors"

/**
 * Verifica autenticacao e retorna o userId.
 * Lanca erro se usuario nao estiver autenticado.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await auth.getUserId(ctx)
  if (!userId) {
    throw new AuthenticationError()
  }
  return userId as string
}

/**
 * Verifica autenticacao e retorna o userId ou null.
 * Nao lanca erro se usuario nao estiver autenticado.
 */
export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const userId = await auth.getUserId(ctx)
  return userId as string | null
}
