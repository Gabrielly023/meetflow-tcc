import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { prisma } from "./config/db.js";

// IMPORTANDO AS ROTAS
import usuarioRouter from "./routes/usuarioRouter.js";

dotenv.config();

const app = express();

// CONFIGURAR CORS
app.use(cors({
  origin: "http://localhost:5173", // URL do frontend (Vite padrão)
  credentials: true
}));

app.use(express.json());

// USANDO AS ROTAS
app.use("/usuarios", usuarioRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  try {
    await prisma.$connect();
    console.log("✅ Banco de dados conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error.message);
  }
});
