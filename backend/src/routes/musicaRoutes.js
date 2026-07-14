import express from "express";
import musicaController from "../controllers/musicaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.delete("/:idMusica", musicaController.remover);
router.post("/:idMusica/voto", musicaController.votar);

export default router;