/**
 * Classes de erro customizadas para o backend Convex.
 * Mensagens em portugues para exibicao ao usuario.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`${entity} nao encontrado`)
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Acesso nao autorizado") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class DuplicateError extends Error {
  constructor(field: string) {
    super(`${field} ja existe`)
    this.name = "DuplicateError"
  }
}

export class AuthenticationError extends Error {
  constructor(message = "Usuario nao autenticado") {
    super(message)
    this.name = "AuthenticationError"
  }
}
