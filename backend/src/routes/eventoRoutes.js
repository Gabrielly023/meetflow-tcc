import express from "express";
import eventoController from "../controllers/eventoController.js";
import participanteController from "../controllers/participanteController.js";
import galeriaController from "../controllers/galeriaController.js";
import localController from "../controllers/localController.js";
import musicaController from "../controllers/musicaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";


const router = express.Router();

// Todas as rotas de evento exigem estar logado
router.use(authMiddleware);

router.get("/", eventoController.listar);
router.get("/:id", eventoController.buscarPorId);
router.post("/", eventoController.criar);
router.put("/:id", eventoController.atualizar);
router.delete("/:id", eventoController.deletar);

router.get("/:id/participantes", participanteController.listar);
router.post("/:id/participantes", participanteController.adicionar);
router.delete("/:id/participantes/me", participanteController.sair);
router.delete("/:id/participantes/:idUsuario", participanteController.remover);
router.post("/:id/participantes/:idUsuario/admin", participanteController.promoverAdmin);
router.delete("/:id/participantes/:idUsuario/admin", participanteController.rebaixarAdmin);

// Galeria
router.get("/:id/galeria", galeriaController.listar);
router.post("/:id/galeria", galeriaController.adicionar);

// Locais / Mapas
router.get("/:id/locais", localController.listar);
router.post("/:id/locais", localController.adicionar);

router.put("/:id/playlist", eventoController.definirPlaylist);
router.delete("/:id/playlist", eventoController.removerPlaylist);

router.get("/:id/musicas", musicaController.listar);
router.post("/:id/musicas", musicaController.adicionar);

export default router;