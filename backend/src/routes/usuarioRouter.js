
import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Cadastro
router.post("/cadastrar", usuarioController.criar);

// Verificação de e-mail durante o cadastro Google
router.post(
  "/verificar-email-google",
  usuarioController.verificarEmailGoogle
);

// Login normal com usuário/e-mail e senha
router.post("/login", usuarioController.login);

// Recuperação de senha
router.post("/esqueci-senha", usuarioController.solicitarResetSenha);
router.post("/redefinir-senha", usuarioController.redefinirSenha);

// Perfil autenticado
router.get("/perfil", authMiddleware, (req, res) => {
  res.json({
    mensagem: "Token válido! Você está autenticado.",
    usuario: req.usuario,
  });
});

// Usuários
router.get("/", usuarioController.listar);
router.get("/:id", usuarioController.buscarPorId);
router.put("/:id", authMiddleware, usuarioController.atualizar);
router.delete("/:id", authMiddleware, usuarioController.deletar);

// Sessão
router.post("/refresh-token", usuarioController.renovarToken);
router.post("/logout", usuarioController.logout);

export default router;
