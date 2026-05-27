import express from "express";
import dotenv from "dotenv";

import "./config/db.js";

// IMPORTANDO AS ROTAS
import usuarioRoutes from "./routes/usuarioRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

// USANDO AS ROTAS
app.use("/usuarios", usuarioRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
