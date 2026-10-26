import test from "node:test";
import assert from "node:assert/strict";
import { Readable, Writable } from "node:stream";
import { createCloudinaryStorage } from "../src/config/cloudinaryStorage.js";

test("upload preserva campos esperados pelos controllers sem disco local", async () => {
  let received = "";
  const sdk = { uploader: { upload_stream(options, callback) {
    assert.equal(options.folder, "meetflow_galeria");
    return new Writable({ write(chunk, _encoding, done) { received += chunk; done(); }, final(done) {
      callback(null, { secure_url: "https://media.invalid/foto", public_id: "foto", bytes: 4 }); done();
    } });
  } } };
  const storage = createCloudinaryStorage(sdk, { folder: "meetflow_galeria" });
  const result = await new Promise((resolve, reject) => storage._handleFile({}, { stream: Readable.from(["foto"]) }, (error, value) => error ? reject(error) : resolve(value)));
  assert.equal(received, "foto");
  assert.deepEqual(result, { path: "https://media.invalid/foto", filename: "foto", size: 4 });
});
test("falha de upload e limpeza usam callback do Multer", async () => {
  const storage = createCloudinaryStorage({ uploader: {
    upload_stream() { throw new Error("indisponivel"); },
    destroy(id, options, callback) { assert.equal(id, "foto"); assert.equal(options.invalidate, true); callback(null); },
  } }, {});
  await new Promise(resolve => storage._handleFile({}, { stream: Readable.from([]) }, error => { assert.match(error.message, /indisponivel/); resolve(); }));
  await new Promise((resolve, reject) => storage._removeFile({}, { filename: "foto" }, error => error ? reject(error) : resolve()));
});
