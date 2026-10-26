import express from "express";
import jwt from "jsonwebtoken";
import { frontendOrigin } from "./config/env.js";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http"; // 1. Importa o módulo HTTP
import { Server } from "socket.io"; // 2. Importa o Socket.io
import { prisma } from "./config/db.js";
import usuarioRouter from "./routes/usuarioRouter.js";
import eventoRouter from "./routes/eventoRoutes.js";
import galeriaRouter from "./routes/galeriaRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import grupoRoutes from "./routes/grupoRoutes.js";
import notificacaoRoutes from "./routes/notificacaoRoutes.js";
import path from "path";
import {
  excluirEventosExpirados,
  INTERVALO_LIMPEZA_EVENTOS_MS,
} from "./services/eventoRetention.js";

dotenv.config();

const app = express();

// 3. Cria o servidor HTTP que envolverá o Express
const httpServer = createServer(app);

// CONFIGURAR CORS
const corsOptions = {
  origin: frontendOrigin(),
  credentials: true,
};

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// 4. Inicializa o Socket.io acoplado ao servidor HTTP
const io = new Server(httpServer, {
  cors: corsOptions,
});

// CORS nao substitui autenticacao, inclusive em conexoes WebSocket.
io.use((socket, next) => {
  try {
    socket.data.usuario = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("Nao autorizado."));
  }
});

async function podeAcessarEvento(socket, id) {
  if (typeof id !== "string" || !id) return false;
  const uid = socket.data.usuario.id_usuario;
  const evento = await prisma.evento.findFirst({
    where: { id_evento: id, excluido_em: null, OR: [
      { id_usuario: uid },
      { participantes: { some: { id_usuario: uid, status: "confirmado" } } },
    ] },
    select: { id_evento: true },
  });
  return Boolean(evento);
}

io.on("connection", (socket) => {
  const uid = socket.data.usuario.id_usuario;
  socket.on("juntar_usuario", (id) => {
    if (id === uid) socket.join(`user_${uid}`);
  });
  socket.on("juntar_evento", async (id) => {
    try {
      if (await podeAcessarEvento(socket, id)) await socket.join(id);
    } catch { socket.emit("erro", { mensagem: "Nao foi possivel acessar o evento." }); }
  });
  socket.on("enviar_mensagem", async (dados) => {
    try {
      if (!dados || !(await podeAcessarEvento(socket, dados.id_evento))) return;
      io.to(dados.id_evento).emit("receber_mensagem", { ...dados, id_usuario: uid, ownerId: uid });
    } catch { socket.emit("erro", { mensagem: "Nao foi possivel enviar a mensagem." }); }
  });
});

app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.resolve("uploads")));
app.set("io", io);
app.use("/galeria", galeriaRouter);
app.use("/eventos", eventoRouter);
app.use("/usuarios", usuarioRouter);
app.use("/chat", chatRouter);
app.use("/eventos/:id/grupo", grupoRoutes);
app.use("/notificacoes", notificacaoRoutes);

const PORT = process.env.PORT || 3000;

// 6. Substitui app.listen por httpServer.listen
httpServer.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Servidor e WebSockets rodando na porta ${PORT}`);

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Banco de dados conectado com sucesso!");
  } catch (error) {
    console.error("Falha na conexao com MySQL:", error.code || error.name);
    // Nao anunciar um servico saudavel sem banco na inicializacao.
    process.exit(1);
  }

  async function limparEventosExpirados() {
    try {
      const quantidade = await excluirEventosExpirados();
      if (quantidade > 0) {
        console.log(`🗑️ Eventos expirados removidos: ${quantidade}`);
      }
    } catch (error) {
      console.error("❌ Erro ao limpar eventos expirados:", error);
    }
  }

  await limparEventosExpirados();
  setInterval(limparEventosExpirados, INTERVALO_LIMPEZA_EVENTOS_MS);
});