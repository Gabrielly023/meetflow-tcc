import validator from "validator";
import { prisma } from "../config/db.js";

const galeriaController = {

  // LISTAR FOTOS DE UM EVENTO
 
  // LISTAR FOTOS DE UM EVENTO
  async listar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({
        where: { id_evento: id },
      });

      if (!evento) {
        return res.status(404).json({
          mensagem: "Evento não encontrado.",
        });
      }

      // Verifica se é organizador ou participante
      const souOrganizador = evento.id_usuario === id_usuario;
      let souParticipante = false;

      if (!souOrganizador) {
        const participacao = await prisma.participantes.findUnique({
          where: {
            id_evento_id_usuario: {
              id_evento: id,
              id_usuario,
            },
          },
        });

        souParticipante = Boolean(participacao);
      }

      if (!souOrganizador && !souParticipante) {
        return res.status(403).json({
          mensagem: "Você não tem acesso a este evento.",
        });
      }

      const fotos = await prisma.galeria.findMany({
        where: { id_evento: id },
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


  // ADICIONAR FOTO (dono = logado)
  
async adicionar(req, res) {
  try {
    const { id } = req.params;
    const { id_usuario } = req.usuario;

    // O arquivo é recebido pelo Multer
    if (!req.file) {
      return res.status(400).json({ mensagem: "Envie uma imagem." });
    }

    // Salva somente o caminho da imagem no banco
    const url_foto = `/uploads/galeria/${req.file.filename}`;

    const apagarArquivo = async () => {
      const fs = await import("fs/promises");
      await fs.unlink(req.file.path).catch(() => {});
    };

    const evento = await prisma.evento.findUnique({
      where: { id_evento: id },
    });

    if (!evento) {
      await apagarArquivo();
      return res.status(404).json({ mensagem: "Evento não encontrado." });
    }

    // Só quem participa ou organiza pode postar foto
    const souOrganizador = evento.id_usuario === id_usuario;
    let souParticipante = false;

    if (!souOrganizador) {
      const participacao = await prisma.participantes.findUnique({
        where: {
          id_evento_id_usuario: {
            id_evento: id,
            id_usuario,
          },
        },
      });

      souParticipante = !!participacao;
    }

    if (!souOrganizador && !souParticipante) {
      await apagarArquivo();
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

    if (req.file?.path) {
      const fs = await import("fs/promises");
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(500).json({
      mensagem: "Erro ao adicionar foto.",
    });
  }
},

  // REMOVER FOTO (só o dono da foto)
  async remover(req, res) {
    try {
      const { idFoto } = req.params;
      const { id_usuario } = req.usuario;

      const foto = await prisma.galeria.findUnique({ where: { id_foto: idFoto } });

      if (!foto) {
        return res.status(404).json({ mensagem: "Foto não encontrada." });
      }

      if (foto.id_usuario !== id_usuario) {
        return res.status(403).json({ mensagem: "Você só pode remover suas próprias fotos." });
      }

      await prisma.galeria.delete({ where: { id_foto: idFoto } });

      res.json({ mensagem: "Foto removida com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao remover foto." });
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
