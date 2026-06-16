import express from "express";
import usuarioController from "../controllers/usuarioController.js";

const router = express.Router();

// GET - listar usuários
router.get("/", usuarioController.listar);

// GET - buscar usuário por ID
router.get("/:id", usuarioController.buscarPorId);

// POST - criar usuário
router.post("/", usuarioController.criar);

// PUT - atualizar usuário completo
router.put("/:id", usuarioController.atualizar);

// DELETE - deletar usuário
router.delete("/:id", usuarioController.deletar);

export default router;
