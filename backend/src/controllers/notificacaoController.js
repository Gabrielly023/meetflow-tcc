import { prisma } from "../config/db.js";

// 1. Criar e enviar notificação (Salva na tabela Chat)
export async function criarNotificacao(req, res) {
  try {
    const { id_usuario_destino, tipo, mensagem, id_evento, id_criador } = req.body || {};

    if (!id_usuario_destino || !tipo || !mensagem || !id_evento) {
      return res.status(400).json({
        erro: "id_usuario_destino, tipo, mensagem e id_evento são obrigatórios.",
      });
    }

    // Converte ambos os IDs para String, conforme exigido pelo seu schema
    const userIdStr = String(id_usuario_destino);
    const eventoIdStr = String(id_evento);

    const [usuarioDestino, evento] = await Promise.all([
      prisma.usuario.findUnique({
        where: { id_usuario: userIdStr },
        select: { id_usuario: true },
      }),
      prisma.evento.findUnique({
        where: { id_evento: eventoIdStr },
        select: { id_evento: true },
      }),
    ]);

    if (!usuarioDestino) {
      return res.status(404).json({
        erro: "Usuário destinatário não encontrado.",
        id_usuario_destino: userIdStr,
      });
    }

    if (!evento) {
      return res.status(404).json({
        erro: "Evento não encontrado.",
        id_evento: eventoIdStr,
      });
    }

    // Salva na tabela Chat
    const novaNotificacaoChat = await prisma.chat.create({
      data: {
        id_usuario: userIdStr,
        id_evento: eventoIdStr,
        tipo: "mensagem",
        conteudo: `[NOTIFICACAO:${tipo}] ${mensagem}`,
      },
      include: {
        usuario: { select: { nome: true } },
        evento: { select: { titulo: true, id_usuario: true } },
      },
    });

    const notificacaoFormatada = {
      id: novaNotificacaoChat.id_chat,
      tipo: tipo,
      mensagem: mensagem,
      usuario: novaNotificacaoChat.usuario?.nome || "Usuário",
      nomeEvento: novaNotificacaoChat.evento?.titulo || "",
      adminId: id_criador || novaNotificacaoChat.evento?.id_usuario || null,
      apenasAdmin: tipo === "pedido_entrada",
      tempo: "Agora",
      lida: false,
    };

    // Dispara via Socket.io em tempo real
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userIdStr}`).emit("receber_notificacao", notificacaoFormatada);
    }

    return res.status(201).json(notificacaoFormatada);
  } catch (error) {
    console.error("Erro ao registrar notificação:", error);
    return res.status(500).json({ erro: "Erro ao registrar notificação.", detalhe: error.message });
  }
}

// 2. Listar Notificações do Usuário
export async function listarNotificacoes(req, res) {
  try {
    const { usuarioId } = req.params;
    const userIdStr = String(usuarioId);

    const registrosChat = await prisma.chat.findMany({
      where: {
        id_usuario: userIdStr,
        conteudo: { startsWith: "[NOTIFICACAO:" },
      },
      orderBy: { criado_em: "desc" },
      include: {
        usuario: { select: { nome: true } },
        evento: { select: { titulo: true, id_usuario: true } },
      },
    });

    const formatadas = registrosChat.map((c) => {
      const matchTipo = c.conteudo.match(/^\[NOTIFICACAO:(.*?)\]\s*(.*)$/);
      const tipo = matchTipo ? matchTipo[1] : "geral";
      const textoMensagem = matchTipo ? matchTipo[2] : c.conteudo;

      return {
        id: c.id_chat,
        tipo: tipo,
        mensagem: textoMensagem,
        usuario: c.usuario?.nome || "Usuário",
        nomeEvento: c.evento?.titulo || "",
        adminId: c.evento?.id_usuario || null,
        apenasAdmin: tipo === "pedido_entrada",
        lida: false,
        tempo: "Salvo",
      };
    });

    return res.status(200).json(formatadas);
  } catch (error) {
    console.error("Erro ao listar notificações:", error);
    return res.status(500).json({ erro: "Erro ao buscar notificações." });
  }
}

// 3. Responder / Excluir Notificação
export async function responderSolicitacao(req, res) {
  try {
    const { id } = req.params;

    const notificacao = await prisma.chat.findUnique({
      where: { id_chat: id },
    });
    if (!notificacao?.conteudo?.startsWith("[NOTIFICACAO:")) {
      return res.status(404).json({ erro: "Notificação não encontrada." });
    }
    await prisma.chat.delete({
      where: { id_chat: id },
    });

    return res.status(200).json({ mensagem: "Notificação respondida com sucesso." });
  } catch (error) {
    console.error("Erro ao responder notificação:", error);
    return res.status(500).json({ erro: "Erro ao responder notificação." });
  }
}