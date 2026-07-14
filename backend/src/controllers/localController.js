import { prisma } from "../config/db.js";

async function temAcesso(evento, id_usuario) {
  if (evento.id_usuario === id_usuario) return true;
  const participacao = await prisma.participantes.findUnique({
    where: { id_evento_id_usuario: { id_evento: evento.id_evento, id_usuario } },
  });
  return !!participacao;
}

const localController = {

  // LISTAR LOCAIS DE UM EVENTO
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

      const locais = await prisma.local.findMany({
        where: { id_evento: id },
        orderBy: { criado_em: "asc" },
      });

      res.json(locais);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao listar locais." });
    }
  },

  // ADICIONAR LOCAL (dono = logado)
  async adicionar(req, res) {
    try {
      const { id } = req.params; // id_evento
      const { id_usuario } = req.usuario;
      const { nome, link_maps } = req.body;

      if (!link_maps) {
        return res.status(400).json({ mensagem: "Envie o link_maps." });
      }

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const local = await prisma.local.create({
        data: { nome, link_maps, id_evento: id, id_usuario },
      });

      res.status(201).json(local);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao adicionar local." });
    }
  },

  // REMOVER LOCAL (dono do local OU organizador do evento)
  async remover(req, res) {
    try {
      const { idLocal } = req.params;
      const { id_usuario } = req.usuario;

      const local = await prisma.local.findUnique({ where: { id_local: idLocal } });
      if (!local) {
        return res.status(404).json({ mensagem: "Local não encontrado." });
      }

      const evento = await prisma.evento.findUnique({ where: { id_evento: local.id_evento } });

      const souDono = local.id_usuario === id_usuario;
      const souOrganizador = evento?.id_usuario === id_usuario;

      if (!souDono && !souOrganizador) {
        return res.status(403).json({
          mensagem: "Apenas o dono do local ou o organizador do evento podem remover.",
        });
      }

      await prisma.local.delete({ where: { id_local: idLocal } });

      res.json({ mensagem: "Local removido com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao remover local." });
    }
  },
};

export default localController;