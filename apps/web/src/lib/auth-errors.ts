/**
 * Translates auth errors to user-friendly Portuguese messages
 */
export function translateAuthError(error: any): string {
  if (!error) {
    return "Ocorreu um erro desconhecido. Tente novamente.";
  }

  const errorMessage = error.message || error.toString() || "";
  const errorString = errorMessage.toLowerCase();

  // Password validation errors
  if (errorString.includes("invalid password") || errorString.includes("validateDefaultPasswordRequirements")) {
    return "A senha não atende aos requisitos mínimos. A senha deve ter pelo menos 8 caracteres e conter letras e números.";
  }

  if (errorString.includes("password") && errorString.includes("too short")) {
    return "A senha é muito curta. Use pelo menos 8 caracteres.";
  }

  if (errorString.includes("password") && errorString.includes("too long")) {
    return "A senha é muito longa. Use no máximo 128 caracteres.";
  }

  if (errorString.includes("password") && errorString.includes("weak")) {
    return "A senha é muito fraca. Use uma combinação de letras, números e caracteres especiais.";
  }

  // Email errors
  if (errorString.includes("invalid email") || errorString.includes("email format")) {
    return "O formato do email é inválido. Verifique se o email está correto.";
  }

  if (errorString.includes("email already exists") || errorString.includes("email already registered")) {
    return "Este email já está cadastrado. Tente fazer login ou use outro email.";
  }

  if (errorString.includes("user not found") || errorString.includes("email not found")) {
    return "Email ou senha incorretos. Verifique suas credenciais.";
  }

  // Authentication errors
  if (errorString.includes("invalid credentials") || errorString.includes("wrong password")) {
    return "Email ou senha incorretos. Verifique suas credenciais.";
  }

  if (errorString.includes("unauthorized") || errorString.includes("not authenticated")) {
    return "Você não está autenticado. Faça login para continuar.";
  }

  if (errorString.includes("account locked") || errorString.includes("account disabled")) {
    return "Sua conta foi bloqueada. Entre em contato com o suporte.";
  }

  // Network/Server errors
  if (errorString.includes("network") || errorString.includes("fetch")) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  if (errorString.includes("timeout")) {
    return "A requisição demorou muito. Tente novamente.";
  }

  if (errorString.includes("server error") || errorString.includes("internal error")) {
    return "Erro no servidor. Tente novamente em alguns instantes.";
  }

  // Generic Convex errors
  if (errorString.includes("convex")) {
    return "Erro ao processar sua solicitação. Tente novamente.";
  }

  // If we can't translate, return a generic message
  // But try to extract a meaningful part if possible
  const match = errorMessage.match(/([A-Z][^.!?]*[.!?])/);
  if (match && match[1] && match[1].length < 100) {
    return match[1];
  }

  return "Ocorreu um erro ao processar sua solicitação. Tente novamente.";
}
