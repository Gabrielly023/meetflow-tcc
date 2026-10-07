import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "../config/db.js";
import { sanitizarTexto } from "../utils/sanitize.js";
import {
  gerarCodigoRecuperacao,
  validarCodigoRecuperacao,
} from "../utils/recuperacaoSenha.js";

const recuperacoesPendentes = new Map();

async function enviarCodigoRecuperacaoPorEmail(email, codigo) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'MeetFlow <noreply@meetflow.com>';

  if (!host || !user || !pass) {
    console.warn(
      `[RECUPERACAO SENHA] SMTP não configurado. Código para ${email}: ${codigo}`
    );
    return;
  }

  const transporte = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporte.sendMail({
    from,
    to: email,
    subject: "Código para redefinir sua senha - MeetFlow",
    html: `
      <div style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 18px; max-width: 520px; margin: 0 auto;">
        <h2 style="margin: 0 0 16px; color: #f8fafc;">Recuperação de senha</h2>
        <p style="margin: 0 0 12px; color: #cbd5e1;">Seu código de verificação é:</p>
        <div style="background: linear-gradient(135deg, #f97316, #d946ef, #38bdf8); color: white; font-size: 28px; font-weight: 700; border-radius: 12px; padding: 18px; text-align: center; letter-spacing: 6px; margin: 20px 0;">${codigo}</div>
        <p style="margin: 0; color: #cbd5e1;">Use esse código para redefinir sua senha dentro de 10 minutos.</p>
      </div>
    `,
  });
}

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
          site: true
        }
      });
      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: "Erro ao listar usuários." });
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
          site: true
        }
      });

      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }

      return res.json(usuario);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: "Erro ao buscar usuário." });
    }
  },

  // CADASTRO
  async criar(req, res) {
    try {
      let { nome, username, email, telefone, senha } = req.body;

      if (!nome || !username || !email || !telefone || !senha) {
        return res.status(400).json({
          mensagem: "Preencha todos os campos obrigatórios."
        });
      }

      nome = sanitizarTexto(nome);

      if (!validator.isEmail(email)) {
        return res.status(400).json({ mensagem: "Email inválido." });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          mensagem: "A senha deve ter no mínimo 6 caracteres."
        });
      }

      if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return res.status(400).json({
          mensagem: "Username deve conter apenas letras, números, pontos ou underline."
        });
      }

      // Limpa qualquer caractere não numérico do telefone para validar os dígitos
      const telefoneLimpo = telefone ? telefone.replace(/\D/g, "") : "";
      if (telefone && (telefoneLimpo.length < 10 || telefoneLimpo.length > 11)) {
        return res.status(400).json({
          mensagem: "Telefone inválido. Deve conter DDD + número (10 ou 11 dígitos)."
        });
      }

      // Verifica se e-mail ou username já existem
      const usuarioExistente = await prisma.usuario.findFirst({
        where: {
          OR: [{ email }, { username }]
        }
      });

      if (usuarioExistente) {
        return res.status(409).json({
          mensagem: "Email ou nome de usuário já cadastrado."
        });
      }

      const senhaCriptografada = await bcrypt.hash(senha, 10);

      // Salva no banco de dados
      const usuario = await prisma.usuario.create({
        data: {
          nome,
          username,
          email,
          telefone: telefoneLimpo,
          senha: senhaCriptografada
        }
      });

      // Gera os tokens para o novo usuário
      const token = jwt.sign(
        { id_usuario: usuario.id_usuario, username: usuario.username },
        process.env.JWT_SECRET || "seusesegredo",
        { expiresIn: "15m" }
      );

      const refreshToken = crypto.randomBytes(40).toString("hex");
      const expiraEm = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          id_usuario: usuario.id_usuario,
          expira_em: expiraEm
        }
      });

      // Remove a senha do objeto de retorno
      const { senha: _, ...usuarioSemSenha } = usuario;

      return res.status(201).json({
        mensagem: "Cadastro realizado com sucesso!",
        usuario: usuarioSemSenha,
        token,
        refreshToken
      });
    } catch (error) {
      console.error("Erro no criar usuário:", error);
      return res.status(500).json({
        mensagem: "Erro ao cadastrar usuário."
      });
    }
  },

  async solicitarResetSenha(req, res) {
    try {
      const identificador = String(req.body.login || req.body.email || "").trim();

      if (!identificador) {
        return res.status(400).json({ mensagem: "Informe o e-mail ou usuário cadastrado." });
      }

      const usuario = await prisma.usuario.findFirst({
        where: {
          OR: [
            { email: identificador.toLowerCase() },
            { username: identificador }
          ]
        }
      });

      if (!usuario) {
        return res.status(404).json({ mensagem: "Nenhum usuário encontrado com esse e-mail ou nome de usuário." });
      }

      const codigo = gerarCodigoRecuperacao();
      const expiraEm = new Date(Date.now() + 10 * 60 * 1000);

      recuperacoesPendentes.set(usuario.email, {
        codigo,
        expiraEm,
        id_usuario: usuario.id_usuario,
      });

      await enviarCodigoRecuperacaoPorEmail(usuario.email, codigo);

      return res.status(200).json({
        mensagem: "Código de recuperação enviado para o seu e-mail.",
        email: usuario.email
      });
    } catch (error) {
      console.error("Erro ao solicitar recuperação de senha:", error);
      return res.status(500).json({ mensagem: "Não foi possível enviar o código. Tente novamente." });
    }
  },

  async redefinirSenha(req, res) {
    try {
      const email = String(req.body.email || "").trim().toLowerCase();
      const codigo = String(req.body.codigo || "").trim();
      const novaSenha = String(req.body.novaSenha || "").trim();

      if (!email || !codigo || !novaSenha) {
        return res.status(400).json({ mensagem: "Preencha o e-mail, o código e a nova senha." });
      }

      const registro = recuperacoesPendentes.get(email);

      if (!registro) {
        return res.status(400).json({ mensagem: "Código de recuperação inválido ou expirado." });
      }

      if (!validarCodigoRecuperacao(registro, codigo)) {
        return res.status(401).json({ mensagem: "Código incorreto ou expirado." });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ mensagem: "A nova senha deve ter no mínimo 6 caracteres." });
      }

      const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

      await prisma.usuario.update({
        where: { id_usuario: registro.id_usuario },
        data: { senha: senhaCriptografada }
      });

      recuperacoesPendentes.delete(email);

      return res.status(200).json({
        mensagem: "Senha redefinida com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      return res.status(500).json({ mensagem: "Não foi possível redefinir a senha." });
    }
  },

  // LOGIN
  async login(req, res) {
    try {
      const { login, senha } = req.body;

      if (!login || !senha) {
        return res.status(400).json({
          mensagem: "Informe email/username e senha."
        });
      }

      const usuario = await prisma.usuario.findFirst({
        where: {
          OR: [{ username: login }, { email: login }]
        }
      });

      if (!usuario) {
        return res.status(404).json({
          mensagem: "Você ainda não possui cadastro. Faça seu cadastro para entrar no MeetFlow."
        });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({
          mensagem: "Senha incorreta."
        });
      }

      // Access token
      const token = jwt.sign(
        { id_usuario: usuario.id_usuario, username: usuario.username },
        process.env.JWT_SECRET || "seusesegredo",
        { expiresIn: "30m" }
      );

      // Refresh token
      const refreshToken = crypto.randomBytes(40).toString("hex");
      const expiraEm = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          id_usuario: usuario.id_usuario,
          expira_em: expiraEm
        }
      });

      const { senha: _, ...usuarioSemSenha } = usuario;

      return res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        usuario: usuarioSemSenha,
        token,
        refreshToken
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: "Erro ao realizar login."
      });
    }
  },

  // RENOVAR ACCESS TOKEN
  async renovarToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ mensagem: "Envie o refreshToken." });
      }

      const tokenSalvo = await prisma.refreshToken.findFirst({
        where: { token: refreshToken }
      });

      if (!tokenSalvo) {
        return res.status(401).json({ mensagem: "Refresh token inválido." });
      }

      if (new Date() > tokenSalvo.expira_em) {
        await prisma.refreshToken.delete({ where: { id: tokenSalvo.id } });
        return res.status(401).json({
          mensagem: "Refresh token expirado. Faça login novamente."
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: tokenSalvo.id_usuario }
      });

      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }

      const novoToken = jwt.sign(
        { id_usuario: usuario.id_usuario, username: usuario.username },
        process.env.JWT_SECRET || "seusesegredo",
        { expiresIn: "30m" }
      );

      return res.status(200).json({
        mensagem: "Token renovado com sucesso!",
        token: novoToken
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: "Erro ao renovar token." });
    }
  },

  // LOGOUT
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ mensagem: "Envie o refreshToken." });
      }

      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
      return res.json({ mensagem: "Logout realizado com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: "Erro ao fazer logout." });
    }
  },

  // ATUALIZAR USUÁRIO
  async atualizar(req, res) {
    try {
      const { id } = req.params;

      if (req.usuario.id_usuario !== id) {
        return res.status(403).json({
          mensagem: "Você não tem permissão para atualizar este usuário."
        });
      }

      let { nome, username, email, telefone, senha, bio, foto_capa, localizacao, site } = req.body;

      if (email && !validator.isEmail(email)) {
        return res.status(400).json({ mensagem: "Email inválido." });
      }

      if (senha && senha.length < 6) {
        return res.status(400).json({ mensagem: "A senha deve ter no mínimo 6 caracteres." });
      }

      // Remove caracteres comuns de formatação (espaços, traços, parênteses e barras)
      // Remove parênteses, traços, espaços e barras antes de validar
    // Remove qualquer caractere que não seja número caso chegue algo formatado
const telefoneLimpo = telefone ? telefone.replace(/\D/g, "") : "";

if (telefone && (telefoneLimpo.length < 10 || telefoneLimpo.length > 11)) {
  return res.status(400).json({
    mensagem: "Telefone inválido. Deve conter DDD + número (10 ou 11 dígitos)."
  });
}

      if (foto_capa && !validator.isURL(foto_capa)) {
        return res.status(400).json({ mensagem: "foto_capa deve ser uma URL válida." });
      }

      if (site && !validator.isURL(site)) {
        return res.status(400).json({ mensagem: "site deve ser uma URL válida." });
      }

      if (nome) nome = sanitizarTexto(nome);
      if (bio) bio = sanitizarTexto(bio);
      if (localizacao) localizacao = sanitizarTexto(localizacao);

      const dadosAtualizados = {
        nome,
        username,
        email,
        telefone,
        bio,
        foto_capa,
        localizacao,
        site
      };

      if (senha) {
        dadosAtualizados.senha = await bcrypt.hash(senha, 10);
      }

      const usuario = await prisma.usuario.update({
        where: { id_usuario: id },
        data: dadosAtualizados
      });

      const { senha: _, ...usuarioSemSenha } = usuario;
      return res.json(usuarioSemSenha);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: "Erro ao atualizar usuário." });
    }
  },

  // GOOGLE LOGIN
  async googleLogin(req, res) {
    try {
      const { email, nome, foto } = req.body;

      if (!email) {
        return res.status(400).json({ mensagem: "E-mail é obrigatório." });
      }

      let usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario) {
        const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        const sufixo = Math.floor(1000 + Math.random() * 9000);
        const usernameGerado = `${baseUsername}_${sufixo}`;

        usuario = await prisma.usuario.create({
          data: {
            email,
            nome: nome || "Usuário Google",
            username: usernameGerado,
            senha: "",
            telefone: "",
            foto_perfil: foto || null
          }
        });
      }

      const token = jwt.sign(
        { id_usuario: usuario.id_usuario },
        process.env.JWT_SECRET || "seusesegredo",
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nome: usuario.nome,
          email: usuario.email,
          username: usuario.username,
          telefone: usuario.telefone
        }
      });
    } catch (error) {
      console.error("Erro detalhado do Google Login:", error);
      return res.status(500).json({
        mensagem: "Erro ao autenticar com o Google.",
        detalhe: error.message
      });
    }
  },

  // DELETAR USUÁRIO
  async deletar(req, res) {
    try {
      const { id } = req.params;

      if (req.usuario.id_usuario !== id) {
        return res.status(403).json({
          mensagem: "Você não tem permissão para deletar este usuário."
        });
      }

      await prisma.usuario.delete({
        where: { id_usuario: id }
      });

      return res.json({ mensagem: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: "Erro ao deletar usuário." });
    }
  }
};

export default usuarioController;