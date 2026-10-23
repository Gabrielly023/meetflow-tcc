// Remova do backend/src/config/upload.js
// Esse arquivo não deve mais ser usado para galeria nem para capas.

import { upload, uploadCapa } from "../middlewares/uploadMiddleware.js";

export { upload, uploadCapa };
export default upload;