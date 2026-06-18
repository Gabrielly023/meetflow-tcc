import { prisma } from "../config/db.js";

const usuarioController = {
  async listar(req, res) {
    const usuarios = await prisma.usuario.findMany();

    res.json(usuarios);
  },

  async buscarPorId(req, res) {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_usuario: id,
      },
    });

    res.json(usuario);
  },

  async criar(req, res) {
    const { nome, email, senha} = req.body;

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha,
      },
    });

    res.status(201).json(usuario);
  },

  async atualizar(req, res) {
    const { id } = req.params;
    const { nome, email, senha} = req.body;

    const usuario = await prisma.usuario.update({
      where: {
        id_usuario: id,
      },
      data: {
        nome,
        email,
        senha,
      },
    });

    res.json(usuario);
  },

  async deletar(req, res) {
    const { id } = req.params;

    await prisma.usuario.delete({
      where: {
        id_usuario: id,
      },
    });

    res.json({
      mensagem: "Usuário deletado com sucesso",
    });
  },
};

export default usuarioController;
