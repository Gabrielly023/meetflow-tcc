// Adapter Multer para o SDK Cloudinary corrigido (v2).
// Preserva req.file.path/filename/size usados pelos controllers.
export function createCloudinaryStorage(cloudinary, params) {
  return {
    _handleFile(_req, file, callback) {
      let completed = false;
      const done = (error, result) => {
        if (completed) return;
        completed = true;
        callback(error, result);
      };
      try {
        const stream = cloudinary.uploader.upload_stream(params, (error, result) => {
          if (error) return done(error);
          if (!result?.secure_url) return done(new Error("Upload sem URL de retorno."));
          done(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
        });
        stream.once("error", done);
        file.stream.once("error", (error) => { stream.destroy(); done(error); });
        file.stream.pipe(stream);
      } catch (error) { done(error); }
    },
    _removeFile(_req, file, callback) {
      cloudinary.uploader.destroy(file.filename, { invalidate: true }, callback);
    },
  };
}
