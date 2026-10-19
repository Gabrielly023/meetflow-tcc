import express from "express";
import localController from "../controllers/localController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.delete("/:idLocal", localController.remover);

export default router;