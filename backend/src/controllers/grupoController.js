import { prisma } from "../config/db.js";
import validator from "validator";
import { sanitizarTexto } from "../utils/sanitize.js";

const grupoController = {

  // GET /eventos/:id/grupo
  async buscar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({
        where: { id_evento: id },
      });

      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      // Só quem participa pode ver o grupo
      const souOrganizador = evento.id_usuario === id_usuario;
      let souParticipante = false;

      if (!souOrganizador) {
        const participacao = await prisma.participantes.findUnique({
          where: { id_evento_id_usuario: { id_evento: id, id_usuario } },
        });
        souParticipante = !!participacao;
      }

      if (!souOrganizador && !souParticipante) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const grupo = {
        nome_grupo: evento.nome_grupo,
        descricao_grupo: evento.descricao_grupo,
        foto_grupo: evento.foto_grupo,
        papel_parede: evento.papel_parede,
      };

      res.json(grupo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao buscar grupo." });
    }
  },

  // PUT /eventos/:id/grupo
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({
        where: { id_evento: id },
      });

      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      // Só admin do evento pode editar o grupo
      const participacao = await prisma.participantes.findUnique({
        where: { id_evento_id_usuario: { id_evento: id, id_usuario } },
      });

      if (!participacao?.admin) {
        return res.status(403).json({
          mensagem: "Apenas administradores do grupo podem editar.",
        });
      }

      let { nome_grupo, descricao_grupo, foto_grupo } = req.body;

      // Validar URLs
      if (foto_grupo && !validator.isURL(foto_grupo)) {
        return res.status(400).json({ mensagem: "foto_grupo deve ser uma URL válida." });
      }

      // Sanitizar
      if (nome_grupo) nome_grupo = sanitizarTexto(nome_grupo);
      if (descricao_grupo) descricao_grupo = sanitizarTexto(descricao_grupo);

      const eventoAtualizado = await prisma.evento.update({
        where: { id_evento: id },
        data: {
          nome_grupo,
          descricao_grupo,
          foto_grupo,
        },
      });

      const grupo = {
        nome_grupo: eventoAtualizado.nome_grupo,
        descricao_grupo: eventoAtualizado.descricao_grupo,
        foto_grupo: eventoAtualizado.foto_grupo,
      };

      res.json(grupo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao atualizar grupo." });
    }
  },

  // PUT /eventos/:id/grupo/papel-parede
  async atualizarPapelParede(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;
      const { papel_parede } = req.body;

      if (!papel_parede) {
        return res.status(400).json({ mensagem: "Envie o papel_parede." });
      }

      if (!validator.isURL(papel_parede)) {
        return res.status(400).json({ mensagem: "papel_parede deve ser uma URL válida." });
      }

      const evento = await prisma.evento.findUnique({
        where: { id_evento: id },
      });

      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      // Qualquer participante pode trocar papel de parede
      const souOrganizador = evento.id_usuario === id_usuario;
      let souParticipante = false;

      if (!souOrganizador) {
        const participacao = await prisma.participantes.findUnique({
          where: { id_evento_id_usuario: { id_evento: id, id_usuario } },
        });
        souParticipante = !!participacao;
      }

      if (!souOrganizador && !souParticipante) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const eventoAtualizado = await prisma.evento.update({
        where: { id_evento: id },
        data: { papel_parede },
      });

      res.json({ papel_parede: eventoAtualizado.papel_parede });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao atualizar papel de parede." });
    }
  },
};

export default grupoController;