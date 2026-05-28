const prisma = require("../config/db");

module.exports = {
  async listar(req, res) {
    const usuarios = await prisma.usuario.findMany();

    res.json(usuarios);
  },

  async buscarPorId(req, res) {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: Number(id),
      },
    });

    res.json(usuario);
  },

  async criar(req, res) {
    const { nome, email } = req.body;

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
      },
    });

    res.status(201).json(usuario);
  },

  async atualizar(req, res) {
    const { id } = req.params;
    const { nome, email } = req.body;

    const usuario = await prisma.usuario.update({
      where: {
        id: Number(id),
      },
      data: {
        nome,
        email,
      },
    });

    res.json(usuario);
  },

  async atualizarParcial(req, res) {
    const { id } = req.params;

    const usuario = await prisma.usuario.update({
      where: {
        id: Number(id),
      },
      data: req.body,
    });

    res.json(usuario);
  },

  async deletar(req, res) {
    const { id } = req.params;

    await prisma.usuario.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      mensagem: "Usuário deletado com sucesso",
    });
  },
};
