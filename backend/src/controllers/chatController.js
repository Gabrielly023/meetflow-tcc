import { prisma } from "../config/db.js";
import { sanitizarTexto } from "../utils/sanitize.js";

async function temAcesso(evento, id_usuario) {
  if (evento.id_usuario === id_usuario) return true;
  const participacao = await prisma.participantes.findUnique({
    where: { id_evento_id_usuario: { id_evento: evento.id_evento, id_usuario } },
  });
  return !!participacao;
}

// Monta o formato de resposta que o frontend espera
function formatarMensagem(msg) {
  const reacoesMapa = {};
  for (const r of msg.reacoes) {
    if (!reacoesMapa[r.emoji]) reacoesMapa[r.emoji] = [];
    reacoesMapa[r.emoji].push(r.id_usuario);
  }

  return {
    id_chat: msg.id_chat,
    id_evento: msg.id_evento,
    id_usuario: msg.id_usuario,
    autor_nome: msg.usuario.nome,
    conteudo: msg.excluido ? null : msg.conteudo,
    tipo: msg.tipo,
    imagem_url: msg.excluido ? null : msg.imagem_url,
    audio_url: msg.excluido ? null : msg.audio_url,
    duracao: msg.duracao,
    criado_em: msg.criado_em,
    editado_em: msg.editado_em,
    excluido: msg.excluido,
    responder_a: msg.mensagemCitada
      ? {
          id_chat: msg.mensagemCitada.id_chat,
          autor_nome: msg.mensagemCitada.usuario.nome,
          conteudo: msg.mensagemCitada.conteudo,
        }
      : null,
    reacoes: reacoesMapa,
    lido_por: msg.leituras.map((l) => l.id_usuario),
  };
}

const chatController = {

  // LISTAR MENSAGENS DO EVENTO
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
          reacoes: true,
          leituras: { where: { lido_em: { not: null } } },
          mensagemCitada: { include: { usuario: { select: { nome: true } } } },
        },
      });

      res.json(mensagens.map(formatarMensagem));
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao listar mensagens do chat." });
    }
  },

  // ENVIAR MENSAGEM
  async enviar(req, res) {
    try {
      const { id } = req.params; // id_evento
      const { id_usuario } = req.usuario;
      let { conteudo, tipo, imagem_url, audio_url, duracao, responder_a } = req.body;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      if (conteudo) conteudo = sanitizarTexto(conteudo);

      const mensagem = await prisma.chat.create({
        data: {
          conteudo: conteudo || null,
          tipo: tipo || "mensagem",
          imagem_url: imagem_url || null,
          audio_url: audio_url || null,
          duracao: duracao || null,
          responder_a: responder_a || null,
          id_evento: id,
          id_usuario,
        },
        include: {
          usuario: { select: { nome: true } },
          reacoes: true,
          leituras: true,
          mensagemCitada: { include: { usuario: { select: { nome: true } } } },
        },
      });

      res.status(201).json(formatarMensagem(mensagem));
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao enviar mensagem." });
    }
  },

  // EDITAR MENSAGEM (só o autor)
  async editar(req, res) {
    try {
      const { idChat } = req.params;
      const { id_usuario } = req.usuario;
      let { conteudo } = req.body;

      const mensagem = await prisma.chat.findUnique({ where: { id_chat: idChat } });
      if (!mensagem) {
        return res.status(404).json({ mensagem: "Mensagem não encontrada." });
      }

      if (mensagem.id_usuario !== id_usuario) {
        return res.status(403).json({ mensagem: "Você só pode editar suas próprias mensagens." });
      }

      if (conteudo) conteudo = sanitizarTexto(conteudo);

      const atualizada = await prisma.chat.update({
        where: { id_chat: idChat },
        data: { conteudo, editado_em: new Date() },
        include: {
          usuario: { select: { nome: true } },
          reacoes: true,
          leituras: true,
          mensagemCitada: { include: { usuario: { select: { nome: true } } } },
        },
      });

      res.json(formatarMensagem(atualizada));
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao editar mensagem." });
    }
  },

  // APAGAR MENSAGEM (autor OU organizador do evento)
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

      await prisma.chat.update({
        where: { id_chat: idChat },
        data: { excluido: true, conteudo: null, imagem_url: null, audio_url: null },
      });

      res.json({ mensagem: "Mensagem apagada com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao apagar mensagem." });
    }
  },

  // ALTERNAR REAÇÃO (emoji)
  async reagir(req, res) {
    try {
      const { idChat } = req.params;
      const { id_usuario } = req.usuario;
      const { emoji } = req.body;

      if (!emoji) {
        return res.status(400).json({ mensagem: "Envie o emoji." });
      }

      const mensagem = await prisma.chat.findUnique({ where: { id_chat: idChat } });
      if (!mensagem) {
        return res.status(404).json({ mensagem: "Mensagem não encontrada." });
      }

      const reacaoExistente = await prisma.chatReacao.findUnique({
        where: { id_chat_id_usuario_emoji: { id_chat: idChat, id_usuario, emoji } },
      });

      if (reacaoExistente) {
        await prisma.chatReacao.delete({
          where: { id_chat_id_usuario_emoji: { id_chat: idChat, id_usuario, emoji } },
        });
      } else {
        await prisma.chatReacao.create({
          data: { id_chat: idChat, id_usuario, emoji },
        });
      }

      const todasReacoes = await prisma.chatReacao.findMany({ where: { id_chat: idChat } });

      const reacoesMapa = {};
      for (const r of todasReacoes) {
        if (!reacoesMapa[r.emoji]) reacoesMapa[r.emoji] = [];
        reacoesMapa[r.emoji].push(r.id_usuario);
      }

      res.json({ reacoes: reacoesMapa });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao reagir à mensagem." });
    }
  },

  // MARCAR TODAS AS MENSAGENS DO EVENTO COMO LIDAS PELO LOGADO
  async marcarLido(req, res) {
    try {
      const { id } = req.params; // id_evento
      const { id_usuario } = req.usuario;

      const mensagens = await prisma.chat.findMany({
        where: { id_evento: id },
        select: { id_chat: true },
      });

      for (const msg of mensagens) {
        await prisma.chatLeitura.upsert({
          where: { id_chat_id_usuario: { id_chat: msg.id_chat, id_usuario } },
          update: { lido_em: new Date() },
          create: { id_chat: msg.id_chat, id_usuario, lido_em: new Date() },
        });
      }

      res.json({ mensagem: "Mensagens marcadas como lidas." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao marcar mensagens como lidas." });
    }
  },
};

export default chatController;