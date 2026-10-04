import { prisma } from "../config/db.js";
import { sanitizarTexto } from "../utils/sanitize.js";

async function temAcesso(evento, id_usuario) {
  if (evento.id_usuario === id_usuario) return true;
  const participacao = await prisma.participantes.findUnique({
    where: { id_evento_id_usuario: { id_evento: evento.id_evento, id_usuario } },
  });
  return !!participacao;
}

// Formata a mensagem para a resposta da API
function formatarMensagem(msg) {
  return {
    id_chat: msg.id_chat,
    id_evento: msg.id_evento,
    id_usuario: msg.id_usuario,
    autor_nome: msg.usuario?.nome || null,
    conteudo: msg.conteudo,
    tipo: msg.tipo,
    criado_em: msg.criado_em,
    editado_em: msg.editado_em,
    responder_a: msg.mensagemCitada
      ? {
          id_chat: msg.mensagemCitada.id_chat,
          autor_nome: msg.mensagemCitada.usuario?.nome || null,
          conteudo: msg.mensagemCitada.conteudo,
        }
      : null,
  };
}

const chatController = {
  // 1. LISTAR MENSAGENS DO EVENTO
  async listar(req, res) {
    try {
      const { id } = req.params; // id_evento
      const { id_usuario } = req.usuario;
      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }
      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }
      const mensagens = await prisma.chat.findMany({
        where: { id_evento: id },
        orderBy: { criado_em: "asc" },
        include: {
          usuario: { select: { nome: true } },
          mensagemCitada: { include: { usuario: { select: { nome: true } } } },
        },
      });
      res.json(mensagens.map(formatarMensagem));
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao listar mensagens do chat." });
    }
  },

  // 2. ENVIAR MENSAGEM (Texto, Imagem, Áudio)
  async enviar(req, res) {
    try {
      const { id } = req.params; // id_evento
      const { id_usuario } = req.usuario;
      let { conteudo, responder_a, tipo } = req.body;

      if (!conteudo || !conteudo.trim()) {
        return res.status(400).json({ mensagem: "O conteúdo da mensagem não pode estar vazio." });
      }
      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }
      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      conteudo = sanitizarTexto(conteudo);

      const mensagem = await prisma.chat.create({
        data: {
          conteudo,
          tipo: tipo || "mensagem", // Aceita tipo personalizado (imagem, audio, etc) ou usa padrão
          responder_a: responder_a || null,
          id_evento: id,
          id_usuario,
        },
        include: {
          usuario: { select: { nome: true } },
          mensagemCitada: { include: { usuario: { select: { nome: true } } } },
        },
      });
      res.status(201).json(formatarMensagem(mensagem));
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao enviar mensagem." });
    }
  },

  // 3. EDITAR MENSAGEM
  async editar(req, res) {
    try {
      const { idChat } = req.params;
      const { id_usuario } = req.usuario;
      let { conteudo } = req.body;
      if (!conteudo || !conteudo.trim()) {
        return res.status(400).json({ mensagem: "O conteúdo da mensagem não pode estar vazio." });
      }
      const mensagem = await prisma.chat.findUnique({ where: { id_chat: idChat } });
      if (!mensagem) {
        return res.status(404).json({ mensagem: "Mensagem não encontrada." });
      }
      if (mensagem.id_usuario !== id_usuario) {
        return res.status(403).json({ mensagem: "Você só pode editar suas próprias mensagens." });
      }
      conteudo = sanitizarTexto(conteudo);
      const atualizada = await prisma.chat.update({
        where: { id_chat: idChat },
        data: { conteudo, editado_em: new Date() },
        include: {
          usuario: { select: { nome: true } },
          mensagemCitada: { include: { usuario: { select: { nome: true } } } },
        },
      });
      res.json(formatarMensagem(atualizada));
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao editar mensagem." });
    }
  },

  // 4. APAGAR MENSAGEM (Definitivo - Hard Delete)
  async apagar(req, res) {
    try {
      const { idChat } = req.params;
      const { id_usuario } = req.usuario;
      const mensagem = await prisma.chat.findUnique({ where: { id_chat: idChat } });
      if (!mensagem) {
        return res.status(404).json({ mensagem: "Mensagem não encontrada." });
      }
      const evento = await prisma.evento.findUnique({ where: { id_evento: mensagem.id_evento } });
      const souAutor = mensagem.id_usuario === id_usuario;
      const souOrganizador = evento?.id_usuario === id_usuario;
      if (!souAutor && !souOrganizador) {
        return res.status(403).json({ mensagem: "Apenas o autor ou o organizador podem apagar esta mensagem." });
      }
      await prisma.chat.delete({
        where: { id_chat: idChat },
      });
      res.json({ mensagem: "Mensagem apagada definitivamente com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao apagar mensagem." });
    }
  },

  // 5. MARCAR CHAT COMO LIDO
  async marcarLido(req, res) {
    try {
      const { id } = req.params; // id_evento
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      res.json({ mensagem: "Chat marcado como lido com sucesso.", id_evento: id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao marcar chat como lido." });
    }
  },

  // 6. REAGIR COM EMOJI
  async reagirEmoji(req, res) {
    try {
      const { idChat } = req.params;
      const { emoji } = req.body;

      if (!emoji) {
        return res.status(400).json({ mensagem: "Envie o emoji para a reação." });
      }

      const mensagemOriginal = await prisma.chat.findUnique({ where: { id_chat: idChat } });
      if (!mensagemOriginal) {
        return res.status(404).json({ mensagem: "Mensagem não encontrada." });
      }

      const mensagemAtualizada = await prisma.chat.update({
        where: { id_chat: idChat },
        data: {
          conteudo: `${mensagemOriginal.conteudo} ${emoji}`,
        },
        include: {
          usuario: { select: { nome: true } },
          mensagemCitada: { include: { usuario: { select: { nome: true } } } },
        },
      });

      res.json(formatarMensagem(mensagemAtualizada));
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao reagir com emoji." });
    }
  },
};

export default chatController;