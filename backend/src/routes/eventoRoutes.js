import express from "express";
import eventoController from "../controllers/eventoController.js";
import participanteController from "../controllers/participanteController.js";
import galeriaController from "../controllers/galeriaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import chatController from "../controllers/chatController.js";
import upload, { uploadCapa } from "../config/upload.js";

const router = express.Router();

function receberCapa(req, res, next) {
  uploadCapa.single("capa")(req, res, (erro) => {
    if (!erro) return next();

    const mensagem =
      erro.code === "LIMIT_FILE_SIZE"
        ? "A imagem da capa deve ter no máximo 5 MB."
        : erro.message;
    return res.status(400).json({ mensagem });
  });
}

// Todas as rotas de evento exigem estar logado
router.use(authMiddleware);

router.get("/lixeira", eventoController.listarLixeira);
router.get("/", eventoController.listar);
router.get("/:id", eventoController.buscarPorId);
router.post("/", receberCapa, eventoController.criar);
router.put("/:id", receberCapa, eventoController.atualizar);
router.patch("/:id/restaurar", eventoController.restaurar);
router.delete("/:id/permanente", eventoController.excluirPermanentemente);
router.delete("/:id", eventoController.deletar);

router.get("/:id/participantes", participanteController.listar);
router.post("/:id/participantes", participanteController.adicionar);
router.delete("/:id/participantes/me", participanteController.sair);
router.delete("/:id/participantes/:idUsuario", participanteController.remover);
router.post(
  "/:id/participantes/:idUsuario/admin",
  participanteController.promoverAdmin
);
router.delete(
  "/:id/participantes/:idUsuario/admin",
  participanteController.rebaixarAdmin
);

// Galeria
router.get("/:id/galeria/lixeira", galeriaController.listarLixeira);
router.get("/:id/galeria", galeriaController.listar);
router.post(
  "/:id/galeria",
  upload.single("foto"),
  galeriaController.adicionar
);

// Locais / Mapas
router.get("/:id/local", eventoController.verLocal);
router.post("/:id/local", eventoController.definirLocal);
router.delete("/:id/local", eventoController.removerLocal);

// Playlist
router.get("/:id/playlist", eventoController.listarPlaylist);
router.post("/:id/playlist", eventoController.adicionarPlaylist);
router.put("/:id/playlist", eventoController.atualizarPlaylist);
router.delete("/:id/playlist", eventoController.removerPlaylist);

// Chat
router.get("/:id/chat", chatController.listar);
router.post("/:id/chat", chatController.enviar);
router.put("/chat/mensagens/:idChat", chatController.editar);
router.delete("/chat/mensagens/:idChat", chatController.apagar);

export default router;