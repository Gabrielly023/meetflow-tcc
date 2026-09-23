import express from "express";
import musicaController from "../controllers/musicaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Listar os links da playlist de um evento
router.get("/:idEvento", musicaController.listar);

// Adicionar um link na playlist (body: { link_spotify })
router.post("/:idEvento", musicaController.adicionar);

// Remover um link da playlist (body: { link_spotify })
router.delete("/:idEvento", musicaController.remover);

export default router;