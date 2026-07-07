import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const usuarioController = {

  // LISTAR TODOS OS USUÁRIOS
  async listar(req, res) {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id_usuario: true,
          nome: true,
          username: true,
          email: true,
          telefone: true,
          foto_perfil: true,
        },
      });
      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao listar usuários." });
    }
  },

  // BUSCAR USUÁRIO POR ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: id },
        select: {
          id_usuario: true,
          nome: true,
          username: true,
          email: true,
          telefone: true,
          foto_perfil: true,
        },
      });

      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }

      res.json(usuario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao buscar usuário." });
    }
  },

  // CADASTRO
  async criar(req, res) {
    try {
      const { nome, username, email, telefone, senha } = req.body;

      if (!nome || !username || !email || !telefone || !senha) {
        return res.status(400).json({
          mensagem: "Preencha todos os campos obrigatórios.",
        });
      }

      const usuarioExistente = await prisma.usuario.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (usuarioExistente) {
        return res.status(409).json({
          mensagem: "Email ou nome de usuário já cadastrado.",
        });
      }

      const senhaCriptografada = await bcrypt.hash(senha, 10);

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          username,
          email,
          telefone,
          senha: senhaCriptografada,
        },
      });

      const { senha: _, ...usuarioSemSenha } = usuario;

      res.status(201).json({
        mensagem: "Cadastro realizado com sucesso!",
        usuario: usuarioSemSenha,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
    }
  },

  // LOGIN
  async login(req, res) {
    try {
      const { login, senha } = req.body;

      if (!login || !senha) {
        return res.status(400).json({
          mensagem: "Informe email/username e senha.",
        });
      }

      const usuario = await prisma.usuario.findFirst({
        where: {
          OR: [{ username: login }, { email: login }],
        },
      });

      if (!usuario) {
        return res.status(404).json({
          mensagem:
            "Você ainda não possui cadastro. Faça seu cadastro para entrar no MeetFlow.",
        });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(401).json({ mensagem: "Senha incorreta." });
      }

      const token = jwt.sign(
        { id_usuario: usuario.id_usuario, username: usuario.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { senha: _, ...usuarioSemSenha } = usuario;

      return res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        usuario: usuarioSemSenha,
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao realizar login." });
    }
  },

  // ATUALIZAR USUÁRIO
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, username, email, telefone, senha } = req.body;

      const dadosAtualizados = { nome, username, email, telefone };

      if (senha) {
        dadosAtualizados.senha = await bcrypt.hash(senha, 10);
      }

      const usuario = await prisma.usuario.update({
        where: { id_usuario: id },
        data: dadosAtualizados,
      });

      const { senha: _, ...usuarioSemSenha } = usuario;

      res.json(usuarioSemSenha);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao atualizar usuário." });
    }
  },

  // DELETAR USUÁRIO
  async deletar(req, res) {
    try {
      const { id } = req.params;

      await prisma.usuario.delete({
        where: { id_usuario: id },
      });

      res.json({ mensagem: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao deletar usuário." });
    }
  },
};

export default usuarioController;