import validator from "validator";
import { prisma } from "../config/db.js";

async function temAcesso(evento, id_usuario) {
  if (evento.id_usuario === id_usuario) return true;
  const participacao = await prisma.participantes.findUnique({
    where: { id_evento_id_usuario: { id_evento: evento.id_evento, id_usuario } },
  });
  return !!participacao;
}

const musicaController = {

  // LISTAR MÚSICAS DO EVENTO (ordenadas por votos)
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

      const musicas = await prisma.musica.findMany({
        where: { id_evento: id },
        include: { votos: true },
      });

      // Monta a resposta com "votos" como lista de ids, ordenada por quantidade
      const resposta = musicas
        .map((m) => ({
          id_musica: m.id_musica,
          link_spotify: m.link_spotify,
          capa_url: m.capa_url,
          id_usuario: m.id_usuario,
          votos: m.votos.map((v) => v.id_usuario),
        }))
        .sort((a, b) => b.votos.length - a.votos.length);

      res.json(resposta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao listar músicas." });
    }
  },

  // ADICIONAR MÚSICA (dono = logado)
  async adicionar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;
      const { link_spotify, titulo, capa_url } = req.body;

      if (!link_spotify) {
        return res.status(400).json({ mensagem: "Envie o link_spotify." });
      }

      if (!validator.isURL(link_spotify)) {
        return res.status(400).json({ mensagem: "link_spotify deve ser uma URL válida." });
      }

      if (capa_url && !validator.isURL(capa_url)) {
        return res.status(400).json({ mensagem: "capa_url deve ser uma URL válida." });
      }

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (!(await temAcesso(evento, id_usuario))) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const musica = await prisma.musica.create({
        data: { link_spotify, titulo, capa_url, id_evento: id, id_usuario },
      });

      res.status(201).json({ ...musica, votos: [] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao adicionar música." });
    }
  },

  // REMOVER MÚSICA (só o dono)
  async remover(req, res) {
    try {
      const { idMusica } = req.params;
      const { id_usuario } = req.usuario;

      const musica = await prisma.musica.findUnique({ where: { id_musica: idMusica } });
      if (!musica) {
        return res.status(404).json({ mensagem: "Música não encontrada." });
      }

      if (musica.id_usuario !== id_usuario) {
        return res.status(403).json({ mensagem: "Você só pode remover suas próprias músicas." });
      }

      await prisma.musica.delete({ where: { id_musica: idMusica } });

      res.json({ mensagem: "Música removida com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao remover música." });
    }
  },

  // ALTERNAR VOTO (curtir/descurtir)
  async votar(req, res) {
    try {
      const { idMusica } = req.params;
      const { id_usuario } = req.usuario;

      const musica = await prisma.musica.findUnique({ where: { id_musica: idMusica } });
      if (!musica) {
        return res.status(404).json({ mensagem: "Música não encontrada." });
      }

      const votoExistente = await prisma.musicaVoto.findUnique({
        where: { id_musica_id_usuario: { id_musica: idMusica, id_usuario } },
      });

      if (votoExistente) {
        // Já tinha votado -> remove o voto (descurtir)
        await prisma.musicaVoto.delete({
          where: { id_musica_id_usuario: { id_musica: idMusica, id_usuario } },
        });
      } else {
        // Não tinha votado -> cria o voto (curtir)
        await prisma.musicaVoto.create({
          data: { id_musica: idMusica, id_usuario },
        });
      }

      const votosAtualizados = await prisma.musicaVoto.findMany({
        where: { id_musica: idMusica },
      });

      res.json({ votos: votosAtualizados.map((v) => v.id_usuario) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao votar na música." });
    }
  },
};

export default musicaController;