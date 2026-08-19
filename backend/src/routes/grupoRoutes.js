import express from "express";
import grupoController from "../controllers/grupoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// GET /eventos/:id/grupo
router.get("/", grupoController.buscar);

// PUT /eventos/:id/grupo
router.put("/", grupoController.atualizar);

// PUT /eventos/:id/grupo/papel-parede
router.put("/papel-parede", grupoController.atualizarPapelParede);

export default router;