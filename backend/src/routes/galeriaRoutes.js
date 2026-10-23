// backend/src/routes/galeriaRoutes.js

import express from "express";
import galeriaController from "../controllers/galeriaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.delete("/:idFoto", galeriaController.remover);

router.patch("/:idFoto/restaurar", galeriaController.restaurar);

router.delete(
  "/:idFoto/permanente",
  galeriaController.excluirPermanentemente,
);

router.post("/:idFoto/curtir", galeriaController.curtir);

export default router;