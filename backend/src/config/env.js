import "dotenv/config";

export function validateEnvironment() {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  if (process.env.NODE_ENV === "production") {
    required.push("FRONTEND_URL", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM");
  }
  for (const key of required) {
    if (!process.env[key]?.trim()) throw new Error(`Variavel obrigatoria ausente: ${key}`);
  }
  if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres aleatorios.");
  }
}

export function frontendOrigin() {
  const value = process.env.FRONTEND_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:5173" : "");
  let url;
  try { url = new URL(value); } catch { throw new Error("FRONTEND_URL deve ser uma origem HTTP(S)."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash || (process.env.NODE_ENV === "production" && url.protocol !== "https:")) {
    throw new Error("FRONTEND_URL deve conter apenas a origem, sem a subpasta; HTTPS em producao.");
  }
  return url.origin;
}
