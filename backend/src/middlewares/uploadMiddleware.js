import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configura o Cloudinary com suas chaves do .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configura o armazenamento do Multer direto no Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "meetflow_galeria", // Nome da pasta que será criada no Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // Formatos permitidos
  },
});

// Exporta o middleware de upload
export const upload = multer({ storage });