import express from "express";
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
  origin: "http://localhost:5173", // URL do frontend
  credentials: true,
};

app.use(cors(corsOptions));

// 4. Inicializa o Socket.io acoplado ao servidor HTTP
const io = new Server(httpServer, {
  cors: corsOptions,
});

// 🔔 Torna o Socket.io acessível dentro dos controllers através de req.app.get("io")


// 5. Configuração dos eventos em tempo real do Socket.io
io.on("connection", (socket) => {
  console.log(`⚡ Usuário conectado via Socket: ${socket.id}`);

  // Entrar na sala do chat do evento específico
  socket.on("juntar_evento", (id_evento) => {
    socket.join(id_evento);
    console.log(`📌 Socket ${socket.id} entrou no evento: ${id_evento}`);
  });

  // 🔔 Entrar na sala pessoal do usuário para receber notificações em tempo real
  socket.on("juntar_usuario", (id_usuario) => {
    const salaUsuario = `user_${id_usuario}`;
    socket.join(salaUsuario);
    console.log(`🔔 Socket ${socket.id} escutando notificações na sala: ${salaUsuario}`);
  });

  // Receber mensagem do chat e retransmitir para a sala
  socket.on("enviar_mensagem", (dadosMensagem) => {
    // dadosMensagem: { id_evento, id_usuario, nome, texto, hora }
    io.to(dadosMensagem.id_evento).emit("receber_mensagem", dadosMensagem);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Usuário desconectado do Socket: ${socket.id}`);
  });
});

app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.resolve("uploads")));
app.set("io", io);
app.use("/galeria", galeriaRouter);
app.use("/usuarios", usuarioRouter);
app.use("/eventos", eventoRouter);
app.use("/chat", chatRouter);
app.use("/eventos/:id/grupo", grupoRoutes);
app.use("/notificacoes", notificacaoRoutes);

const PORT = process.env.PORT || 3000;

// 6. Substitui app.listen por httpServer.listen
httpServer.listen(PORT, async () => {
  console.log(`🚀 Servidor e WebSockets rodando na porta ${PORT}`);

  try {
    await prisma.$connect();
    console.log("✅ Banco de dados conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    return;
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