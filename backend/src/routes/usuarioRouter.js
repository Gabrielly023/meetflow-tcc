import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Cadastro
router.post("/", usuarioController.criar);

// Login
router.post("/login", usuarioController.login);

// 🔒 Rota de teste do middleware — devolve os dados do usuário logado
router.get("/perfil", authMiddleware, (req, res) => {
  res.json({
    mensagem: "Token válido! Você está autenticado.",
    usuario: req.usuario,
  });
});

// Listar usuários
router.get("/", usuarioController.listar);

// Buscar usuário por ID
router.get("/:id", usuarioController.buscarPorId);

// Atualizar usuário (agora protegida)
router.put("/:id", authMiddleware, usuarioController.atualizar);

// Deletar usuário (agora protegida)
router.delete("/:id", authMiddleware, usuarioController.deletar);

router.post("/refresh-token", usuarioController.renovarToken);
router.post("/logout", usuarioController.logout);

export default router;