const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");

// GET - listar usuários
router.get("/", usuarioController.listar);

// GET - buscar usuário por ID
router.get("/:id", usuarioController.buscarPorId);

// POST - criar usuário
router.post("/", usuarioController.criar);

// PUT - atualizar usuário completo
router.put("/:id", usuarioController.atualizar);

// PATCH - atualizar parcialmente
router.patch("/:id", usuarioController.atualizarParcial);

// DELETE - deletar usuário
router.delete("/:id", usuarioController.deletar);

module.exports = router;
