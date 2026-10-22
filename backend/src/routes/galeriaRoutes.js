import express from "express";
import galeriaController from "../controllers/galeriaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js"; // IMPORTANTE: Importa o multer + cloudinary

const router = express.Router();

// Exige autenticação para todas as rotas da galeria
router.use(authMiddleware);

// ROTA DE UPLOAD DA FOTO:
// Recebe a imagem no campo "foto", envia pro Cloudinary e chama o controller
router.post("/eventos/:id_evento", upload.single("foto"), galeriaController.adicionar);

// Rotas existentes:
router.delete("/:idFoto", galeriaController.remover);
router.patch("/:idFoto/restaurar", galeriaController.restaurar);
router.delete("/:idFoto/permanente", galeriaController.excluirPermanentemente);

router.post("/:idFoto/curtir", galeriaController.curtir);

export default router;