import express from "express";
import chatController from "../controllers/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Aplica a autenticação a todas as rotas
router.use(authMiddleware);

// Mensagens no contexto do evento
router.get("/eventos/:id", chatController.listar);
router.post("/eventos/:id", chatController.enviar);

// Ações em mensagens individuais
router.put("/mensagens/:idChat", chatController.editar);
router.delete("/mensagens/:idChat", chatController.apagar);

router.post("/eventos/:id/lido", chatController.marcarLido);
router.post("/mensagens/:idChat/reagir", chatController.reagirEmoji);
export default router;
