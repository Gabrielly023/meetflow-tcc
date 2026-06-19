import express from "express";
import usuarioController from "../controllers/usuarioController.js";

const router = express.Router();

// Cadastro
router.post("/", usuarioController.criar);

// Login
router.post("/login", usuarioController.login);

// Listar usuários
router.get("/", usuarioController.listar);

// Buscar usuário por ID
router.get("/:id", usuarioController.buscarPorId);

// Atualizar usuário
router.put("/:id", usuarioController.atualizar);

// Deletar usuário
router.delete("/:id", usuarioController.deletar);

export default router;
