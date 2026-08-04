import express from "express";
import chatController from "../controllers/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.put("/:idChat", chatController.editar);
router.delete("/:idChat", chatController.apagar);
router.post("/:idChat/reacao", chatController.reagir);

export default router;