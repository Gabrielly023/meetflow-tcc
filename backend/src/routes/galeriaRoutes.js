import express from "express";
import galeriaController from "../controllers/galeriaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.delete("/:idFoto", galeriaController.remover);

router.post("/:idFoto/curtir", galeriaController.curtir);

export default router;