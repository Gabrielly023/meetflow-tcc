import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import { prisma } from "../config/db.js";
import { sanitizarTexto } from "../utils/sanitize.js";

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
          bio: true,
          foto_capa: true,
          localizacao: true,
          site: true,
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
          bio: true,
          foto_capa: true,
          localizacao: true,
          site: true,
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
      let { nome, username, email, telefone, senha } = req.body;

      if (!nome || !username || !email || !telefone || !senha) {
        return res.status(400).json({
          mensagem: "Preencha todos os campos obrigatórios.",
        });
      }

      nome = sanitizarTexto(nome);

      if (!validator.isEmail(email)) {
        return res.status(400).json({ mensagem: "Email inválido." });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          mensagem: "A senha deve ter no mínimo 6 caracteres.",
        });
      }

      if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return res.status(400).json({
          mensagem: "Username deve conter apenas letras, números, pontos ou underline.",
        });
      }

      if (telefone && !/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/.test(telefone)) {
        return res.status(400).json({
          mensagem: "Telefone inválido. Use formato: (XX) XXXXX-XXXX ou 10-11 dígitos.",
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

      // Access token: curto, usado nas requisições normais
      const token = jwt.sign(
        { id_usuario: usuario.id_usuario, username: usuario.username },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      // Refresh token: longo, só serve para renovar o access token
      const refreshToken = crypto.randomBytes(40).toString("hex");
      const expiraEm = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

      await prisma.refreshToken.create({
        data: { token: refreshToken, id_usuario: usuario.id_usuario, expira_em: expiraEm },
      });

      const { senha: _, ...usuarioSemSenha } = usuario;

      return res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        usuario: usuarioSemSenha,
        token,
        refreshToken,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao realizar login." });
    }
  },

  // RENOVAR O ACCESS TOKEN USANDO O REFRESH TOKEN
  async renovarToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ mensagem: "Envie o refreshToken." });
      }

      const registro = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!registro) {
        return res.status(401).json({ mensagem: "Refresh token inválido." });
      }

      if (registro.expira_em < new Date()) {
        await prisma.refreshToken.delete({ where: { token: refreshToken } });
        return res.status(401).json({ mensagem: "Refresh token expirado. Faça login novamente." });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: registro.id_usuario },
      });

      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }

      const novoToken = jwt.sign(
        { id_usuario: usuario.id_usuario, username: usuario.username },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ token: novoToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao renovar token." });
    }
  },

  // LOGOUT (revoga o refresh token)
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ mensagem: "Envie o refreshToken." });
      }

      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });

      res.json({ mensagem: "Logout realizado com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao fazer logout." });
    }
  },

  // ATUALIZAR USUÁRIO
  async atualizar(req, res) {
    try {
      const { id } = req.params;

      if (req.usuario.id_usuario !== id) {
        return res.status(403).json({
          mensagem: "Você não tem permissão para atualizar este usuário.",
        });
      }

      let { nome, username, email, telefone, senha, bio, foto_capa, localizacao, site } = req.body;

      if (email && !validator.isEmail(email)) {
        return res.status(400).json({ mensagem: "Email inválido." });
      }

      if (senha && senha.length < 6) {
        return res.status(400).json({
          mensagem: "A senha deve ter no mínimo 6 caracteres.",
        });
      }

      if (telefone && !/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/.test(telefone)) {
        return res.status(400).json({
          mensagem: "Telefone inválido. Use formato: (XX) XXXXX-XXXX ou 10-11 dígitos.",
        });
      }

      // Validar URLs
      if (foto_capa && !validator.isURL(foto_capa)) {
        return res.status(400).json({ mensagem: "foto_capa deve ser uma URL válida." });
      }

      if (site && !validator.isURL(site)) {
        return res.status(400).json({ mensagem: "site deve ser uma URL válida." });
      }

      if (nome) nome = sanitizarTexto(nome);
      if (bio) bio = sanitizarTexto(bio);
      if (localizacao) localizacao = sanitizarTexto(localizacao);

      const dadosAtualizados = { nome, username, email, telefone, bio, foto_capa, localizacao, site };

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

      if (req.usuario.id_usuario !== id) {
        return res.status(403).json({
          mensagem: "Você não tem permissão para deletar este usuário.",
        });
      }

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