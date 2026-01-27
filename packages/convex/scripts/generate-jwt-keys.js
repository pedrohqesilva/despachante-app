import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

/**
 * Script para gerar chaves JWT para Convex Auth
 * 
 * Execute: npm run generate:jwt-keys
 * 
 * As chaves geradas devem ser configuradas no dashboard do Convex:
 * 1. Acesse https://dashboard.convex.dev
 * 2. Selecione seu projeto
 * 3. Vá em Settings > Environment Variables
 * 4. Adicione JWT_PRIVATE_KEY com o valor da chave privada
 * 5. Adicione JWKS com o valor do JSON Web Key Set
 */

async function generateJWTKeys() {
  console.log("🔑 Gerando par de chaves RS256 para Convex Auth...\n");

  try {
    // Gerar par de chaves RS256
    const { publicKey, privateKey } = await generateKeyPair("RS256", {
      extractable: true,
    });

    // Exportar chave privada no formato PKCS8
    const privateKeyPEM = await exportPKCS8(privateKey);

    // Exportar chave pública no formato JWK
    const publicKeyJWK = await exportJWK(publicKey);

    // Criar JWKS (JSON Web Key Set)
    const jwks = JSON.stringify(
      {
        keys: [
          {
            use: "sig",
            kty: publicKeyJWK.kty,
            kid: publicKeyJWK.kid,
            alg: "RS256",
            ...publicKeyJWK,
          },
        ],
      },
      null,
      2
    );

    // Converter newlines para espaços na chave privada (formato esperado pelo Convex)
    const privateKeyFormatted = privateKeyPEM.replace(/\n/g, " ");

    console.log("✅ Chaves geradas com sucesso!\n");
    console.log("=".repeat(80));
    console.log("📋 Variáveis de Ambiente para o Dashboard do Convex:\n");
    console.log("=".repeat(80));
    console.log("\n1️⃣  JWT_PRIVATE_KEY:");
    console.log("-".repeat(80));
    console.log(privateKeyFormatted);
    console.log("-".repeat(80));
    console.log("\n2️⃣  JWKS:");
    console.log("-".repeat(80));
    console.log(jwks);
    console.log("-".repeat(80));
    console.log("\n📝 Instruções:");
    console.log("1. Acesse https://dashboard.convex.dev");
    console.log("2. Selecione seu projeto");
    console.log("3. Vá em Settings > Environment Variables");
    console.log("4. Adicione JWT_PRIVATE_KEY com o valor acima");
    console.log("5. Adicione JWKS com o valor JSON acima");
    console.log("\n⚠️  IMPORTANTE: Mantenha a chave privada segura e nunca a compartilhe!\n");
  } catch (error) {
    console.error("❌ Erro ao gerar chaves:", error);
    process.exit(1);
  }
}

generateJWTKeys();
