import validator from "validator";
import { prisma } from "../config/db.js";

async function temAcesso(evento, id_usuario) {
  if (evento.id_usuario === id_usuario) return true;
  const participacao = await prisma.participantes.findUnique({
    where: { id_evento_id_usuario: { id_evento: evento.id_evento, id_usuario } },
  });
  return !!participacao;
}

// O campo playlist_spotify guarda um JSON stringificado de um array de links.
// Se estiver vazio/nulo, ou não for um JSON válido, tratamos como lista vazia.
function parsePlaylist(playlist_spotify) {
  if (!playlist_spotify) return [];
  try {
    const parsed = JSON.parse(playlist_spotify);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const musicaController = {
  // LISTAR OS LINKS DA PLAYLIST DO EVENTO
  async listar(req, res) {
    try {
      const { idEvento } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({ where: { id_evento: idEvento } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      res.json(parsePlaylist(evento.playlist_spotify));
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao listar playlist." });
    }
  },

  // ADICIONAR UM LINK NA PLAYLIST DO EVENTO
  async adicionar(req, res) {
    try {
      const { idEvento } = req.params;
      const { id_usuario } = req.usuario;
      const { link_spotify } = req.body;

      if (!link_spotify) {
        return res.status(400).json({ mensagem: "Envie o link_spotify." });
      }

      if (!validator.isURL(link_spotify)) {
        return res.status(400).json({ mensagem: "link_spotify deve ser uma URL válida." });
      }

      const evento = await prisma.evento.findUnique({ where: { id_evento: idEvento } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const links = parsePlaylist(evento.playlist_spotify);

      if (links.includes(link_spotify)) {
        return res.status(409).json({ mensagem: "Esse link já está na playlist." });
      }

      links.push(link_spotify);

      await prisma.evento.update({
        where: { id_evento: idEvento },
        data: { playlist_spotify: JSON.stringify(links) },
      });

      res.status(201).json(links);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao adicionar link na playlist." });
    }
  },

  // REMOVER UM LINK DA PLAYLIST DO EVENTO (pelo link exato)
  async remover(req, res) {
    try {
      const { idEvento } = req.params;
      const { id_usuario } = req.usuario;
      const { link_spotify } = req.body;

      if (!link_spotify) {
        return res.status(400).json({ mensagem: "Envie o link_spotify a remover." });
      }

      const evento = await prisma.evento.findUnique({ where: { id_evento: idEvento } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const links = parsePlaylist(evento.playlist_spotify);
      const novaLista = links.filter((link) => link !== link_spotify);

      if (novaLista.length === links.length) {
        return res.status(404).json({ mensagem: "Esse link não está na playlist." });
      }

      await prisma.evento.update({
        where: { id_evento: idEvento },
        data: { playlist_spotify: JSON.stringify(novaLista) },
      });

      res.json(novaLista);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao remover link da playlist." });
    }
  },
};

export default musicaController;