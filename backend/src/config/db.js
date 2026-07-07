import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";

// Extrai host, usuário, senha, porta e nome do banco a partir da DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: dbUrl.port ? Number(dbUrl.port) : 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace("/", ""), // remove a barra inicial
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export { prisma };