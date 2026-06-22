import { prisma } from "../config/db.js";

const usuarioController = {

  // LISTAR TODOS OS USUÁRIOS
  async listar(req, res) {

    const usuarios = await prisma.usuario.findMany();

    res.json(usuarios);

  },


  // BUSCAR USUÁRIO POR ID
  async buscarPorId(req, res) {

    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_usuario: id,
      },
    });

    res.json(usuario);

  },


  // CADASTRO
  async criar(req, res) {

    const { nome, email, telefone, senha } = req.body;

    // Verifica se já existe um usuário com esse email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        email: email
      }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        mensagem: "Esse usuário já existe"
      });
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        telefone,
        senha,
      },
    });

    console.log("Usuário criado com sucesso:");
    console.log(usuario);

    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso!",
      usuario
    });

  },


  // LOGIN
  async login(req, res) {

    const { login, senha } = req.body;

    const usuario = await prisma.usuario.findFirst({

      where: {

        OR: [

          { nome: login },

          { email: login }

        ]

      }

    });


    // Usuário não possui cadastro
    if (!usuario) {

      return res.status(404).json({

        mensagem:
          "Você ainda não possui cadastro. Faça seu cadastro para entrar no MeetFlow."

      });

    }


    // Senha incorreta
    if (usuario.senha !== senha) {

      return res.status(401).json({

        mensagem: "Senha incorreta."

      });

    }


    // Login realizado com sucesso
    return res.status(200).json({

      mensagem: "Login realizado com sucesso!",

      usuario

    });

  },


  // ATUALIZAR USUÁRIO
  async atualizar(req, res) {

    const { id } = req.params;

    const { nome, email, telefone, senha } = req.body;


    const usuario = await prisma.usuario.update({

      where: {

        id_usuario: id,

      },

      data: {

        nome,

        email,

        telefone,

        senha,

      },

    });


    res.json(usuario);

  },


  // DELETAR USUÁRIO
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