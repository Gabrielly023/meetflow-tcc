import { prisma } from "../config/db.js";
import validator from "validator";
import galeriaController from "../controllers/galeriaController.js";
import { sanitizarTexto } from "../utils/sanitize.js";

// Organizador OU participante do evento
async function temAcesso(evento, id_usuario) {
  if (evento.id_usuario === id_usuario) return true;
  const participacao = await prisma.participantes.findUnique({
    where: { id_evento_id_usuario: { id_evento: evento.id_evento, id_usuario } },
  });
  return !!participacao;
}

// Lê o campo playlist_spotify (JSON) e sempre devolve um array,
// mesmo se estiver null, vazio ou vier como string (compatibilidade)
function obterPlaylist(evento) {
  const valor = evento.playlist_spotify;
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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
        descricao
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

      // Valida URLs
      if (capa_url && !validator.isURL(capa_url)) {
        return res
          .status(400)
          .json({ mensagem: "capa_url deve ser uma URL válida." });
      }

      let nome_grupo, descricao_grupo;

      // Sanitizar campos do grupo
      if (req.body.nome_grupo) nome_grupo = sanitizarTexto(req.body.nome_grupo);

      if (req.body.descricao_grupo)
        descricao_grupo = sanitizarTexto(req.body.descricao_grupo);

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
          id_usuario,
          // O criador já entra como participante, papel organizador
          participantes: {
            create: {
              id_usuario,
              papel: "organizador",
              status: "confirmado",
              admin: true
            }
          }
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
        capa_url,
        nome_grupo,
        descricao_grupo,
        foto_grupo,
        papel_parede
      } = req.body;

      if (foto_grupo && !validator.isURL(foto_grupo)) {
        return res
          .status(400)
          .json({ mensagem: "foto_grupo deve ser uma URL válida." });
      }

      if (papel_parede && !validator.isURL(papel_parede)) {
        return res
          .status(400)
          .json({ mensagem: "papel_parede deve ser uma URL válida." });
      }

      // Sanitizar
      if (nome_grupo) nome_grupo = sanitizarTexto(nome_grupo);
      if (descricao_grupo) descricao_grupo = sanitizarTexto(descricao_grupo);
      if (titulo) titulo = sanitizarTexto(titulo);
      if (descricao) descricao = sanitizarTexto(descricao);
      if (localizacao) localizacao = sanitizarTexto(localizacao);
      if (tipo) tipo = sanitizarTexto(tipo);

      // Valida URL da capa, se for enviada
      if (capa_url && !validator.isURL(capa_url)) {
        return res
          .status(400)
          .json({ mensagem: "capa_url deve ser uma URL válida." });
      }

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
  },

  // VER O LINK DE MAPA DO EVENTO
  async verLocal(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      res.json({ google_maps: evento.google_maps });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao buscar o local do evento." });
    }
  },

  // DEFINIR/TROCAR O LINK DE MAPA DO EVENTO (só organizador)
  async definirLocal(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;
      const { google_maps } = req.body;

      if (!google_maps) {
        return res.status(400).json({ mensagem: "Envie o google_maps." });
      }

      if (!validator.isURL(google_maps)) {
        return res.status(400).json({ mensagem: "google_maps deve ser uma URL válida." });
      }

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (evento.id_usuario !== id_usuario) {
        return res
          .status(403)
          .json({ mensagem: "Apenas o organizador pode definir o local do evento." });
      }

      const eventoAtualizado = await prisma.evento.update({
        where: { id_evento: id },
        data: { google_maps: google_maps }
      });

      res.json({ google_maps: eventoAtualizado.google_maps });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao definir o local do evento." });
    }
  },

  // REMOVER O LINK DE MAPA DO EVENTO (só organizador)
  async removerLocal(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (evento.id_usuario !== id_usuario) {
        return res
          .status(403)
          .json({ mensagem: "Apenas o organizador pode remover o local do evento." });
      }

      await prisma.evento.update({
        where: { id_evento: id },
        data: { google_maps: null }
      });

      res.json({ mensagem: "Local do evento removido com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao remover o local do evento." });
    }
  },

  // LISTAR OS LINKS DA PLAYLIST DO EVENTO (organizador ou qualquer participante)
  async listarPlaylist(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      res.json({ playlist_spotify: obterPlaylist(evento) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao buscar a playlist do evento." });
    }
  },

  // ADICIONAR UM LINK NA PLAYLIST (qualquer participante do evento)
  async adicionarPlaylist(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;
      const { link_spotify } = req.body;

      if (!link_spotify) {
        return res.status(400).json({ mensagem: "Envie o link_spotify." });
      }

      if (!validator.isURL(link_spotify)) {
        return res.status(400).json({ mensagem: "link_spotify deve ser uma URL válida." });
      }

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const playlistAtual = obterPlaylist(evento);

      if (playlistAtual.includes(link_spotify)) {
        return res.status(400).json({ mensagem: "Esse link já está na playlist." });
      }

      const novaPlaylist = [...playlistAtual, link_spotify];
      const novaPlaylistString = JSON.stringify(novaPlaylist);

      if (novaPlaylistString.length > 500) {
        return res.status(400).json({
          mensagem: "Limite de tamanho da playlist atingido. Remova algum link antes de adicionar outro."
        });
      }

      const eventoAtualizado = await prisma.evento.update({
        where: { id_evento: id },
        data: { playlist_spotify: novaPlaylistString }
      });

      res.status(201).json({ playlist_spotify: obterPlaylist(eventoAtualizado) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao adicionar link na playlist." });
    }
  },

  // ATUALIZAR (TROCAR) UM LINK JÁ EXISTENTE NA PLAYLIST (qualquer participante do evento)
  async atualizarPlaylist(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;
      const { link_antigo, link_novo } = req.body;

      if (!link_antigo || !link_novo) {
        return res.status(400).json({ mensagem: "Envie o link_antigo e o link_novo." });
      }

      if (!validator.isURL(link_novo)) {
        return res.status(400).json({ mensagem: "link_novo deve ser uma URL válida." });
      }

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const playlistAtual = obterPlaylist(evento);
      const indice = playlistAtual.indexOf(link_antigo);

      if (indice === -1) {
        return res.status(404).json({ mensagem: "Link não encontrado na playlist." });
      }

      if (playlistAtual.includes(link_novo)) {
        return res.status(400).json({ mensagem: "Esse link já está na playlist." });
      }

      const novaPlaylist = [...playlistAtual];
      novaPlaylist[indice] = link_novo;
      const novaPlaylistString = JSON.stringify(novaPlaylist);

      if (novaPlaylistString.length > 500) {
        return res.status(400).json({
          mensagem: "Limite de tamanho da playlist atingido."
        });
      }

      const eventoAtualizado = await prisma.evento.update({
        where: { id_evento: id },
        data: { playlist_spotify: novaPlaylistString }
      });

      res.json({ playlist_spotify: obterPlaylist(eventoAtualizado) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao atualizar link da playlist." });
    }
  },

  // REMOVER UM LINK DA PLAYLIST PELO VALOR EXATO (qualquer participante do evento)
  async removerPlaylist(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;
      const { link_spotify } = req.body;

      if (!link_spotify) {
        return res.status(400).json({ mensagem: "Envie o link_spotify." });
      }

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const playlistAtual = obterPlaylist(evento);

      if (!playlistAtual.includes(link_spotify)) {
        return res.status(404).json({ mensagem: "Link não encontrado na playlist." });
      }

      const novaPlaylist = playlistAtual.filter((link) => link !== link_spotify);

      const eventoAtualizado = await prisma.evento.update({
        where: { id_evento: id },
        data: { playlist_spotify: JSON.stringify(novaPlaylist) }
      });

      res.json({ playlist_spotify: obterPlaylist(eventoAtualizado) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao remover link da playlist." });
    }
  }
};

export default eventoController;