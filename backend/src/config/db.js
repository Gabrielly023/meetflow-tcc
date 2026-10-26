import "dotenv/config";
import { readFileSync } from "node:fs";
import { validateEnvironment } from "./env.js";
validateEnvironment();
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";

// Extrai host, usuário, senha, porta e nome do banco a partir da DATABASE_URL
let dbUrl;
try {
  dbUrl = new URL(process.env.DATABASE_URL);
  if (dbUrl.protocol !== "mysql:" || !dbUrl.hostname || dbUrl.pathname.length < 2) throw new Error();
} catch {
  throw new Error("DATABASE_URL deve ter formato mysql://usuario:senha@host:porta/banco.");
}
if (![undefined, "true", "false"].includes(process.env.DB_SSL)) {
  throw new Error("DB_SSL deve ser true ou false.");
}

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: dbUrl.port ? Number(dbUrl.port) : 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: decodeURIComponent(dbUrl.pathname.slice(1)), // remove a barra inicial
  connectionLimit: 5,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  ssl: process.env.DB_SSL === "true" ? {
    rejectUnauthorized: true,
    ...(process.env.DB_SSL_CA ? { ca: readFileSync(process.env.DB_SSL_CA, "utf8") } : {}),
  } : undefined,
});

const prisma = new PrismaClient({ adapter });

export { prisma };