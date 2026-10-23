import { prisma } from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";

function obterPublicIdCloudinary(url) {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return null;
  }

  const partes = url.split("/upload/");

  if (partes.length !== 2) {
    return null;
  }

  const caminho = partes[1]
    .replace(/^v\d+\//, "")
    .split("?")[0];

  return caminho.replace(/\.[^/.]+$/, "");
}

async function removerImagemCloudinary(url) {
  const publicId = obterPublicIdCloudinary(url);

  if (!publicId) {
    return;
  }

  const resultado = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    type: "upload",
    invalidate: true,
  });

  if (!["ok", "not found"].includes(resultado.result)) {
    throw new Error(
      `Erro ao remover imagem do Cloudinary: ${resultado.result}`,
    );
  }
}

async function buscarAcessoEvento(eventoId, usuarioId) {
  const evento = await prisma.evento.findUnique({
    where: {
      id_evento: eventoId,
    },
  });

  if (!evento) {
    return {
      evento: null,
      permitido: false,
    };
  }

  if (evento.id_usuario === usuarioId) {
    return {
      evento,
      permitido: true,
    };
  }

  const participacao = await prisma.participantes.findUnique({
    where: {
      id_evento_id_usuario: {
        id_evento: eventoId,
        id_usuario: usuarioId,
      },
    },
  });

  return {
    evento,
    permitido: Boolean(participacao),
  };
}

const galeriaController = {
  async listar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const { evento, permitido } = await buscarAcessoEvento(
        id,
        id_usuario,
      );

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
        where: {
          id_evento: id,
          excluido_em: null,
        },
        orderBy: {
          postado_em: "desc",
        },
        include: {
          curtidas: true,
        },
      });

      const resposta = fotos.map((foto) => ({
        id_foto: foto.id_foto,
        url_foto: foto.url_foto,
        postado_em: foto.postado_em,
        id_usuario: foto.id_usuario,
        curtidas: foto.curtidas.map(
          (curtida) => curtida.id_usuario,
        ),
      }));

      return res.json(resposta);
    } catch (error) {
      console.error("Erro ao listar fotos da galeria:", error);

      return res.status(500).json({
        mensagem: "Erro ao listar fotos da galeria.",
      });
    }
  },

  async listarLixeira(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const { evento, permitido } = await buscarAcessoEvento(
        id,
        id_usuario,
      );

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
        where: {
          id_evento: id,
          id_usuario,
          excluido_em: {
            not: null,
          },
        },
        orderBy: {
          excluido_em: "desc",
        },
        include: {
          curtidas: true,
        },
      });

      const resposta = fotos.map((foto) => ({
        id_foto: foto.id_foto,
        url_foto: foto.url_foto,
        postado_em: foto.postado_em,
        id_usuario: foto.id_usuario,
        excluido_em: foto.excluido_em,
        curtidas: foto.curtidas.map(
          (curtida) => curtida.id_usuario,
        ),
      }));

      return res.json(resposta);
    } catch (error) {
      console.error("Erro ao listar lixeira da galeria:", error);

      return res.status(500).json({
        mensagem: "Erro ao listar a lixeira da galeria.",
      });
    }
  },

  async adicionar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      if (!req.file || !req.file.path) {
        return res.status(400).json({
          mensagem: "Envie uma imagem.",
        });
      }

      const { evento, permitido } = await buscarAcessoEvento(
        id,
        id_usuario,
      );

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

      const foto = await prisma.galeria.create({
        data: {
          url_foto: req.file.path,
          id_evento: id,
          id_usuario,
        },
      });

      return res.status(201).json({
        id_foto: foto.id_foto,
        url_foto: foto.url_foto,
        postado_em: foto.postado_em,
        id_evento: foto.id_evento,
        id_usuario: foto.id_usuario,
        excluido_em: foto.excluido_em,
      });
    } catch (error) {
      console.error("Erro ao adicionar foto na galeria:", error);

      return res.status(500).json({
        mensagem: "Erro ao adicionar foto.",
      });
    }
  },

  async remover(req, res) {
    try {
      const { idFoto } = req.params;
      const { id_usuario } = req.usuario;

      const foto = await prisma.galeria.findUnique({
        where: {
          id_foto: idFoto,
        },
      });

      if (!foto) {
        return res.status(404).json({
          mensagem: "Foto não encontrada.",
        });
      }

      if (foto.id_usuario !== id_usuario) {
        return res.status(403).json({
          mensagem: "Você só pode remover suas próprias fotos.",
        });
      }

      if (foto.excluido_em) {
        return res.status(400).json({
          mensagem: "A foto já está na lixeira.",
        });
      }

      await prisma.galeria.update({
        where: {
          id_foto: idFoto,
        },
        data: {
          excluido_em: new Date(),
        },
      });

      return res.json({
        mensagem: "Foto movida para a lixeira.",
      });
    } catch (error) {
      console.error("Erro ao mover foto para a lixeira:", error);

      return res.status(500).json({
        mensagem: "Erro ao mover a foto para a lixeira.",
      });
    }
  },

  async restaurar(req, res) {
    try {
      const { idFoto } = req.params;
      const { id_usuario } = req.usuario;

      const foto = await prisma.galeria.findUnique({
        where: {
          id_foto: idFoto,
        },
      });

      if (!foto || !foto.excluido_em) {
        return res.status(404).json({
          mensagem: "Foto não encontrada na lixeira.",
        });
      }

      if (foto.id_usuario !== id_usuario) {
        return res.status(403).json({
          mensagem: "Apenas quem enviou a foto pode restaurá-la.",
        });
      }

      await prisma.galeria.update({
        where: {
          id_foto: idFoto,
        },
        data: {
          excluido_em: null,
        },
      });

      return res.json({
        mensagem: "Foto restaurada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao restaurar foto:", error);

      return res.status(500).json({
        mensagem: "Erro ao restaurar a foto.",
      });
    }
  },

  async excluirPermanentemente(req, res) {
    try {
      const { idFoto } = req.params;
      const { id_usuario } = req.usuario;

      const foto = await prisma.galeria.findUnique({
        where: {
          id_foto: idFoto,
        },
      });

      if (!foto || !foto.excluido_em) {
        return res.status(404).json({
          mensagem: "Foto não encontrada na lixeira.",
        });
      }

      if (foto.id_usuario !== id_usuario) {
        return res.status(403).json({
          mensagem:
            "Apenas quem enviou a foto pode excluí-la permanentemente.",
        });
      }

      await removerImagemCloudinary(foto.url_foto);

      await prisma.galeria.delete({
        where: {
          id_foto: idFoto,
        },
      });

      return res.json({
        mensagem: "Foto excluída permanentemente.",
      });
    } catch (error) {
      console.error(
        "Erro ao excluir foto permanentemente:",
        error,
      );

      return res.status(500).json({
        mensagem: "Erro ao excluir a foto permanentemente.",
      });
    }
  },

  async curtir(req, res) {
    try {
      const { idFoto } = req.params;
      const { id_usuario } = req.usuario;

      const foto = await prisma.galeria.findUnique({
        where: {
          id_foto: idFoto,
        },
      });

      if (!foto || foto.excluido_em) {
        return res.status(404).json({
          mensagem: "Foto não encontrada.",
        });
      }

      const { permitido } = await buscarAcessoEvento(
        foto.id_evento,
        id_usuario,
      );

      if (!permitido) {
        return res.status(403).json({
          mensagem: "Você não tem acesso a este evento.",
        });
      }

      const curtidaExistente =
        await prisma.galeriaCurtida.findUnique({
          where: {
            id_foto_id_usuario: {
              id_foto: idFoto,
              id_usuario,
            },
          },
        });

      if (curtidaExistente) {
        await prisma.galeriaCurtida.delete({
          where: {
            id_foto_id_usuario: {
              id_foto: idFoto,
              id_usuario,
            },
          },
        });

        return res.json({
          mensagem: "Foto descurtida.",
          curtida: false,
        });
      }

      await prisma.galeriaCurtida.create({
        data: {
          id_foto: idFoto,
          id_usuario,
        },
      });

      return res.status(201).json({
        mensagem: "Foto curtida.",
        curtida: true,
      });
    } catch (error) {
      console.error("Erro ao curtir foto:", error);

      return res.status(500).json({
        mensagem: "Erro ao curtir foto.",
      });
    }
  },
};

export default galeriaController;