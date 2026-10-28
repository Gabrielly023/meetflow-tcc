import { OAuth2Client } from "google-auth-library";

export const googleOAuthClient = new OAuth2Client();

export class GoogleAuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function verifyGoogleCredential(credential) {
  if (typeof credential !== "string" || !credential.trim() || credential.length > 16384) {
    throw new GoogleAuthError(400, "GOOGLE_CREDENTIAL_REQUIRED", "Envie a credencial de login do Google.");
  }
  const audience = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!audience) {
    throw new GoogleAuthError(503, "GOOGLE_NOT_CONFIGURED", "Login Google ainda não configurado no servidor.");
  }
  let payload;
  try {
    const ticket = await googleOAuthClient.verifyIdToken({ idToken: credential, audience });
    payload = ticket.getPayload();
  } catch {
    throw new GoogleAuthError(401, "GOOGLE_INVALID_CREDENTIAL", "Credencial Google inválida ou expirada. Tente novamente.");
  }
  if (!payload?.sub || typeof payload.email !== "string" || payload.email_verified !== true) {
    throw new GoogleAuthError(401, "GOOGLE_EMAIL_UNVERIFIED", "O Google não confirmou o e-mail desta conta.");
  }
  const email = payload.email.trim().toLowerCase();
  return {
    sub: payload.sub,
    email,
    // Para enderecos externos sem Workspace, exigir prova adicional no primeiro vinculo.
    authoritativeEmail: email.endsWith("@gmail.com") || Boolean(payload.hd),
  };
}
