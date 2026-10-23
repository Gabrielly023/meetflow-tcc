// backend/src/middlewares/uploadMiddleware.js

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function criarStorageCloudinary(folder) {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        {
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    },
  });
}

function criarUpload(folder) {
  return multer({
    storage: criarStorageCloudinary(folder),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith("image/")) {
        return callback(new Error("Envie apenas arquivos de imagem."));
      }

      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });
}

export const upload = criarUpload("meetflow_galeria");

export const uploadCapa = criarUpload("meetflow_capas");