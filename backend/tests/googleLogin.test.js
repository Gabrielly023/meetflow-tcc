import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import express from "express";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "mysql://test:test@127.0.0.1:31988/test";
process.env.DB_SSL = "false";
process.env.JWT_SECRET = "test-only-meetflow-signing-secret";
process.env.GOOGLE_CLIENT_ID = "test-client.apps.googleusercontent.com";
const { googleOAuthClient } = await import("../src/services/googleAuth.js");
const { prisma } = await import("../src/config/db.js");
const { default: router } = await import("../src/routes/usuarioRouter.js");
const keys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicKey = keys.publicKey.export({ type: "spki", format: "pem" });
function credential(changes = {}, key = keys.privateKey) {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign({ sub: "google-person", email: "person@gmail.com", email_verified: true,
    aud: process.env.GOOGLE_CLIENT_ID, iss: "https://accounts.google.com", iat: now, exp: now + 3600,
    ...changes }, key, { algorithm: "RS256", keyid: "test-key" });
}

test("login Google HTTP com assinatura real e banco isolado", async t => {
  // Apenas a origem das chaves e o banco sao substituidos; a verificacao criptografica e real.
  const originals = { certs: googleOAuthClient.getFederatedSignonCertsAsync, find: prisma.usuario.findUnique,
    update: prisma.usuario.updateMany, refresh: prisma.refreshToken.create };
  googleOAuthClient.getFederatedSignonCertsAsync = async () => ({ certs: { "test-key": publicKey }, format: "PEM" });
  let users, sessions;
  const hash = await bcrypt.hash("current-password", 4);
  const reset = () => { users = [{ id_usuario: "u1", username: "person", email: "person@gmail.com", senha: hash, google_sub: null }]; sessions = []; };
  prisma.usuario.findUnique = async ({ where }) => users.find(u => Object.entries(where).every(([k,v]) => u[k] === v)) || null;
  prisma.usuario.updateMany = async ({ where, data }) => {
    const matches = users.filter(u => Object.entries(where).every(([k,v]) => u[k] === v));
    matches.forEach(u => Object.assign(u, data)); return { count: matches.length };
  };
  prisma.refreshToken.create = async ({ data }) => { sessions.push(data); return data; };
  const app = express(); app.use(express.json()); app.use("/usuarios", router);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const url = `http://127.0.0.1:${server.address().port}/usuarios/google`;
  const post = async body => { const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json() }; };
  try {
    await t.test("rejeita email sem credencial e formulario", async () => {
      reset(); assert.equal((await post({ email: "person@gmail.com" })).status, 400);
      assert.equal((await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" })).status, 415);
      assert.equal(sessions.length, 0);
    });
    for (const [name, claims] of Object.entries({ audiencia: { aud: "another-client" }, emissor: { iss: "https://attacker.invalid" }, expiracao: { iat: 1, exp: 100 }, emailNaoVerificado: { email_verified: false }, semSubject: { sub: "" } })) {
      await t.test(`rejeita ${name}`, async () => { reset(); assert.equal((await post({ credential: credential(claims) })).status, 401); assert.equal(sessions.length, 0); assert.equal(users[0].google_sub, null); });
    }
    await t.test("rejeita assinatura falsificada", async () => {
      reset(); const forged = generateKeyPairSync("rsa", { modulusLength: 2048 });
      assert.equal((await post({ credential: credential({}, forged.privateKey) })).status, 401); assert.equal(sessions.length, 0);
    });
    await t.test("nao cria conta desconhecida", async () => {
      reset(); assert.equal((await post({ credential: credential({ email: "unknown@gmail.com" }) })).status, 404); assert.equal(users.length, 1); assert.equal(sessions.length, 0);
    });
    await t.test("vincula Gmail verificado e emite sessao sem expor senha", async () => {
      reset(); const r = await post({ credential: credential(), email: "attacker@gmail.com" });
      assert.equal(r.status, 200); assert.equal(users[0].google_sub, "google-person");
      assert.equal(jwt.verify(r.body.token, process.env.JWT_SECRET).id_usuario, "u1");
      assert.equal(r.body.refreshToken, sessions[0].token); assert.equal(r.body.usuario.senha, undefined); assert.equal(r.body.usuario.google_sub, undefined);
    });
    await t.test("identidade vinculada usa sub mesmo se email mudou", async () => {
      reset(); users[0].google_sub = "google-person";
      assert.equal((await post({ credential: credential({ email: "changed@example.org" }) })).status, 200);
    });
    await t.test("primeiro vinculo de email externo exige senha correta", async () => {
      reset(); users[0].email = "person@example.org"; const token = credential({ email: users[0].email });
      for (const senha of [undefined, "wrong-password"]) {
        const r = await post({ credential: token, senha }); assert.equal(r.status, 401); assert.equal(r.body.code, "GOOGLE_PASSWORD_REQUIRED");
      }
      assert.equal(users[0].google_sub, null); assert.equal(sessions.length, 0);
      assert.equal((await post({ credential: token, senha: "current-password" })).status, 200);
    });
    await t.test("Workspace verificado permite primeiro vinculo", async () => {
      reset(); users[0].email = "person@example.org";
      assert.equal((await post({ credential: credential({ email: users[0].email, hd: "example.org" }) })).status, 200);
    });
    await t.test("nao sobrescreve outra identidade", async () => {
      reset(); users[0].google_sub = "other-person";
      assert.equal((await post({ credential: credential() })).status, 409); assert.equal(users[0].google_sub, "other-person"); assert.equal(sessions.length, 0);
    });
    await t.test("sem configuracao falha sem emitir tokens", async () => {
      reset(); const token = credential(); const id = process.env.GOOGLE_CLIENT_ID; delete process.env.GOOGLE_CLIENT_ID;
      try { assert.equal((await post({ credential: token })).status, 503); assert.equal(sessions.length, 0); } finally { process.env.GOOGLE_CLIENT_ID = id; }
    });
  } finally {
    googleOAuthClient.getFederatedSignonCertsAsync = originals.certs;
    prisma.usuario.findUnique = originals.find; prisma.usuario.updateMany = originals.update; prisma.refreshToken.create = originals.refresh;
    await new Promise(resolve => server.close(resolve)); await prisma.$disconnect();
  }
});
