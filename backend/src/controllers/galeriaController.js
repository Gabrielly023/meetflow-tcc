import { prisma } from "../config/db.js";
import { unlink } from "fs/promises";
import path from "path";

async function temAcessoEvento(eventoId, usuarioId) {
  const evento = await prisma.evento.findUnique({
    where: { id_evento: eventoId },
  });
  if (!evento) return { evento: null, permitido: false };
  if (evento.id_usuario === usuarioId) return { evento, permitido: true };

  const participacao = await prisma.participantes.findUnique({
    where: {
      id_evento_id_usuario: {
        id_evento: eventoId,
        id_usuario: usuarioId,
      },
    },
  });
  return { evento, permitido: Boolean(participacao) };
}

async function removerArquivoFoto(url) {
  const prefixo = "/uploads/galeria/";
  if (typeof url !== "string" || !url.startsWith(prefixo)) return;

  const pastaUploads = path.resolve("uploads/galeria");
  const caminho = path.resolve(pastaUploads, path.basename(url));
  if (!caminho.startsWith(`${pastaUploads}${path.sep}`)) return;

  try {
    await unlink(caminho);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Não foi possível remover o arquivo da galeria:", error);
    }
  }
}

const galeriaController = {

  // LISTAR FOTOS DE UM EVENTO
 
  // LISTAR FOTOS DE UM EVENTO
  async listar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const { evento, permitido } = await temAcessoEvento(id, id_usuario);

      if (!evento) {
        return res.status(404).json({
          mensagem: "Evento não encontrado.",
        });
      }

      if (!permitido) {
        return res.status(403).json({
          mensagem: "Você não tem acesso a este evento.",
        });
      }

      const fotos = await prisma.galeria.findMany({
        where: { id_evento: id, excluido_em: null },
        orderBy: { postado_em: "desc" },
        include: { curtidas: true },
      });

      const resposta = fotos.map((foto) => ({
        id_foto: foto.id_foto,
        url_foto: foto.url_foto,
        postado_em: foto.postado_em,
        id_usuario: foto.id_usuario,
        curtidas: foto.curtidas.map((curtida) => curtida.id_usuario),
      }));

      return res.json(resposta);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: "Erro ao listar fotos da galeria.",
      });
    }
  },

  async listarLixeira(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;
      const { evento, permitido } = await temAcessoEvento(id, id_usuario);

      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }
      if (!permitido) {
        return res.status(403).json({
          mensagem: "Você não tem acesso a este evento.",
        });
      }

      const fotos = await prisma.galeria.findMany({
        where: {
          id_evento: id,
          id_usuario,
          excluido_em: { not: null },
        },
        orderBy: { excluido_em: "desc" },
        include: { curtidas: true },
      });

      return res.json(
        fotos.map((foto) => ({
          id_foto: foto.id_foto,
          url_foto: foto.url_foto,
          postado_em: foto.postado_em,
          id_usuario: foto.id_usuario,
          excluido_em: foto.excluido_em,
          curtidas: foto.curtidas.map((curtida) => curtida.id_usuario),
        })),
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: "Erro ao listar a lixeira da galeria.",
      });
    }
  },


  // ADICIONAR FOTO (dono = logado)
  
async adicionar(req, res) {
  try {
    const { id } = req.params;
    const { id_usuario } = req.usuario;

    // Se o upload falhar ou o arquivo não vier, retorna erro
    if (!req.file || !req.file.path) {
      return res.status(400).json({ mensagem: "Envie uma imagem." });
    }

    // O Cloudinary devolve a URL remota hospedada em req.file.path
    const url_foto = req.file.path;

    const { evento, permitido } = await temAcessoEvento(id, id_usuario);

    if (!evento) {
      return res.status(404).json({ mensagem: "Evento não encontrado." });
    }

    if (!permitido) {
      return res.status(403).json({
        mensagem: "Você não tem acesso a este evento.",
      });
    }

    const foto = await prisma.galeria.create({
      data: {
        url_foto,
        id_evento: id,
        id_usuario,
      },
    });

    return res.status(201).json(foto);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao adicionar foto.",
    });
  }
},

  // Mover a foto para a lixeira (só o dono da foto)
  async remover(req, res) {
    try {
      const { idFoto } = req.params;
      const { id_usuario } = req.usuario;

      const foto = await prisma.galeria.findUnique({
        where: { id_foto: idFoto },
      });

      if (!foto) {
        return res.status(404).json({ mensagem: "Foto não encontrada." });
      }

      if (foto.id_usuario !== id_usuario) {
        return res.status(403).json({ mensagem: "Você só pode remover suas próprias fotos." });
      }

      if (foto.excluido_em) {
        return res.status(400).json({ mensagem: "A foto já está na lixeira." });
      }

      await prisma.galeria.update({
        where: { id_foto: idFoto },
        data: { excluido_em: new Date() },
      });

      res.json({ mensagem: "Foto movida para a lixeira." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao mover a foto para a lixeira." });
    }
  },

  async restaurar(req, res) {
    try {
      const { idFoto } = req.params;
      const { id_usuario } = req.usuario;
      const foto = await prisma.galeria.findUnique({
        where: { id_foto: idFoto },
      });

      if (!foto || !foto.excluido_em) {
        return res.status(404).json({ mensagem: "Foto não encontrada na lixeira." });
      }
      if (foto.id_usuario !== id_usuario) {
        return res.status(403).json({
          mensagem: "Apenas quem enviou a foto pode restaurá-la.",
        });
      }

      await prisma.galeria.update({
        where: { id_foto: idFoto },
        data: { excluido_em: null },
      });
      return res.json({ mensagem: "Foto restaurada com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: "Erro ao restaurar a foto." });
    }
  },

  async excluirPermanentemente(req, res) {
    try {
      const { idFoto } = req.params;
      const { id_usuario } = req.usuario;
      const foto = await prisma.galeria.findUnique({
        where: { id_foto: idFoto },
      });

      if (!foto || !foto.excluido_em) {
        return res.status(404).json({ mensagem: "Foto não encontrada na lixeira." });
      }
      if (foto.id_usuario !== id_usuario) {
        return res.status(403).json({
          mensagem: "Apenas quem enviou a foto pode excluí-la permanentemente.",
        });
      }

      await prisma.galeria.delete({ where: { id_foto: idFoto } });
      await removerArquivoFoto(foto.url_foto);
      return res.json({ mensagem: "Foto excluída permanentemente." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: "Erro ao excluir a foto permanentemente.",
      });
    }
  },
  // ALTERNAR CURTIDA (curtir/descurtir)
async curtir(req, res) {
  try {
    const { idFoto } = req.params;
    const { id_usuario } = req.usuario;

    const foto = await prisma.galeria.findUnique({ where: { id_foto: idFoto } });
    if (!foto) {
      return res.status(404).json({ mensagem: "Foto não encontrada." });
    }
    if (foto.excluido_em) {
      return res.status(404).json({ mensagem: "Foto não encontrada." });
    }

    const curtidaExistente = await prisma.galeriaCurtida.findUnique({
      where: { id_foto_id_usuario: { id_foto: idFoto, id_usuario } },
    });

    if (curtidaExistente) {
      // Descurtir
      await prisma.galeriaCurtida.delete({
        where: { id_foto_id_usuario: { id_foto: idFoto, id_usuario } },
      });
      res.json({ mensagem: "Foto descurtida.", curtida: false });
    } else {
      // Curtir
      await prisma.galeriaCurtida.create({
        data: { id_foto: idFoto, id_usuario },
      });
      res.status(201).json({ mensagem: "Foto curtida.", curtida: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao curtir foto." });
  }
}
};



export default galeriaController;
