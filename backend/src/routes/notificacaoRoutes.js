import { Router } from "express";
import {
  criarNotificacao,
  listarNotificacoes,
  responderSolicitacao,
} from "../controllers/notificacaoController.js";

const router = Router();

router.post("/", criarNotificacao); // POST http://localhost:3000/notificacoes
router.get("/:usuarioId", listarNotificacoes); // GET http://localhost:3000/notificacoes/1
router.patch("/:id/responder", responderSolicitacao); // PATCH http://localhost:3000/notificacoes/1/responder

export default router;