import express from "express";
import eventoController from "../controllers/eventoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas de evento exigem estar logado
router.use(authMiddleware);

router.get("/", eventoController.listar);
router.get("/:id", eventoController.buscarPorId);
router.post("/", eventoController.criar);
router.put("/:id", eventoController.atualizar);
router.delete("/:id", eventoController.deletar);

export default router;