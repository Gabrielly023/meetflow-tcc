import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

function criarUpload(subdiretorio) {
  const pastaUploads = path.resolve("uploads", subdiretorio);
  fs.mkdirSync(pastaUploads, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, pastaUploads);
    },
    filename: (req, file, cb) => {
      const extensao = path.extname(file.originalname).toLowerCase();
      const nomeUnico = `${Date.now()}-${crypto.randomUUID()}${extensao}`;
      cb(null, nomeUnico);
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Envie apenas arquivos de imagem."));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });
}

const upload = criarUpload("galeria");
export const uploadCapa = criarUpload("eventos");

export default upload;
