import { prisma } from "../config/db.js";
import galeriaController from "../controllers/galeriaController.js";
import { sanitizarTexto } from "../utils/sanitize.js";

const eventoController = {
  // LISTAR EVENTOS DO USUÁRIO LOGADO (criados ou que participa)
  async listar(req, res) {
    try {
      const { id_usuario } = req.usuario;

      const eventos = await prisma.evento.findMany({
        where: {
          OR: [{ id_usuario }, { participantes: { some: { id_usuario } } }]
        },
        orderBy: { data_hora: "asc" }
      });

      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao listar eventos." });
    }
  },

  // BUSCAR EVENTO POR ID (só organizador ou participante)
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({
        where: { id_evento: id }
      });

      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      const souOrganizador = evento.id_usuario === id_usuario;

      let souParticipante = false;
      if (!souOrganizador) {
        const participacao = await prisma.participantes.findUnique({
          where: {
            id_evento_id_usuario: { id_evento: id, id_usuario }
          }
        });
        souParticipante = !!participacao;
      }

      if (!souOrganizador && !souParticipante) {
        return res
          .status(403)
          .json({ mensagem: "Você não tem acesso a este evento." });
      }

      res.json(evento);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao buscar evento." });
    }
  },

  // CRIAR EVENTO (logado vira organizador)
  async criar(req, res) {
    try {
      const { id_usuario } = req.usuario;
      let {
        capa_url,
        titulo,
        tipo,
        data_hora,
        data_hora_fim,
        localizacao,
        senha_acesso,
        descricao,
        google_maps,
        playlist_spotify
      } = req.body;

      if (!titulo || !data_hora) {
        return res.status(400).json({
          mensagem:
            "Preencha os campos obrigatórios: título, data e senha de acesso."
        });
      }

      // Valida se a data enviada é válida de verdade
      if (isNaN(new Date(data_hora).getTime())) {
        return res.status(400).json({ mensagem: "data_hora inválida." });
      }

      // Sanitiza campos de texto livre
      titulo = sanitizarTexto(titulo);
      if (descricao) descricao = sanitizarTexto(descricao);
      if (localizacao) localizacao = sanitizarTexto(localizacao);
      if (tipo) tipo = sanitizarTexto(tipo);

      const evento = await prisma.evento.create({
        data: {
          titulo,
          descricao,
          data_hora: new Date(data_hora),
          data_hora_fim: data_hora_fim ? new Date(data_hora_fim) : null,
          localizacao,
          senha_acesso,
          tipo,
          capa_url,
          google_maps,
          playlist_spotify,
          id_usuario
          // O criador já entra como participante, papel organizador
          // participantes: {
          //   create: {
          //     id_usuario,
          //     papel: "organizador",
          //     status: "confirmado",
          //     admin: true
          //   }
          // }
        }
      });

      res.status(201).json(evento);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao criar evento." });
    }
  },

  // ATUALIZAR EVENTO (só organizador)
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({
        where: { id_evento: id }
      });

      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (evento.id_usuario !== id_usuario) {
        return res.status(403).json({
          mensagem: "Apenas o organizador pode editar este evento."
        });
      }

      let {
        titulo,
        descricao,
        data_hora,
        data_hora_fim,
        localizacao,
        senha_acesso,
        tipo,
        capa_url
      } = req.body;

      if (titulo) titulo = sanitizarTexto(titulo);
      if (descricao) descricao = sanitizarTexto(descricao);
      if (localizacao) localizacao = sanitizarTexto(localizacao);
      if (tipo) tipo = sanitizarTexto(tipo);

      const eventoAtualizado = await prisma.evento.update({
        where: { id_evento: id },
        data: {
          titulo,
          descricao,
          data_hora: data_hora ? new Date(data_hora) : undefined,
          data_hora_fim: data_hora_fim ? new Date(data_hora_fim) : undefined,
          localizacao,
          senha_acesso,
          tipo,
          capa_url
        }
      });

      res.json(eventoAtualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao atualizar evento." });
    }
  },

  // DELETAR EVENTO (só organizador)
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({
        where: { id_evento: id }
      });

      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (evento.id_usuario !== id_usuario) {
        return res.status(403).json({
          mensagem: "Apenas o organizador pode excluir este evento."
        });
      }

      await prisma.evento.delete({ where: { id_evento: id } });

      res.json({ mensagem: "Evento excluído com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao excluir evento." });
    }
  }

  // DEFINIR/TROCAR A PLAYLIST DO EVENTO
  // async definirPlaylist(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const { id_usuario } = req.usuario;
  //     const { link_spotify } = req.body;

  //     if (!link_spotify) {
  //       return res.status(400).json({ mensagem: "Envie o link_spotify." });
  //     }

  //     const evento = await prisma.evento.findUnique({
  //       where: { id_evento: id }
  //     });
  //     if (!evento) {
  //       return res.status(404).json({ mensagem: "Evento não encontrado." });
  //     }

  //     if (evento.id_usuario !== id_usuario) {
  //       return res
  //         .status(403)
  //         .json({ mensagem: "Apenas o organizador pode definir a playlist." });
  //     }

  //     const eventoAtualizado = await prisma.evento.update({
  //       where: { id_evento: id },
  //       data: { playlist_spotify: link_spotify }
  //     });

  //     res.json(eventoAtualizado);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ mensagem: "Erro ao definir playlist." });
  //   }
  // },

  // // REMOVER A PLAYLIST DO EVENTO
  // async removerPlaylist(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const { id_usuario } = req.usuario;

  //     const evento = await prisma.evento.findUnique({
  //       where: { id_evento: id }
  //     });
  //     if (!evento) {
  //       return res.status(404).json({ mensagem: "Evento não encontrado." });
  //     }

  //     if (evento.id_usuario !== id_usuario) {
  //       return res
  //         .status(403)
  //         .json({ mensagem: "Apenas o organizador pode remover a playlist." });
  //     }

  //     const eventoAtualizado = await prisma.evento.update({
  //       where: { id_evento: id },
  //       data: { playlist_spotify: null }
  //     });

  //     res.json(eventoAtualizado);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ mensagem: "Erro ao remover playlist." });
  //   }
  // }
};

export default eventoController;
