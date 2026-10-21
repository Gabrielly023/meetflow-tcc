import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

const pastaUploads = path.resolve("uploads/galeria");

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

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Envie apenas arquivos de imagem."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB por foto
  },
});

export default upload;
