import test from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "mysql://audit:audit@127.0.0.1:31988/audit";
process.env.JWT_SECRET = "audit-only-not-a-production-secret";
process.env.DB_SSL = "false";
const { prisma } = await import("../src/config/db.js");
const { listarNotificacoes, responderSolicitacao } = await import("../src/controllers/notificacaoController.js");
function response() {
  return { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(data) { this.data = data; return this; } };
}
test("usuario nao pode listar notificacoes de outra conta", async () => {
  const res = response();
  await listarNotificacoes({ params: { usuarioId: "other" }, usuario: { id_usuario: "me" } }, res);
  assert.equal(res.statusCode, 403);
});
test("usuario nao pode excluir notificacao de outra conta", async () => {
  const originalFind = prisma.chat.findUnique;
  const originalDelete = prisma.chat.delete;
  let deleted = false;
  prisma.chat.findUnique = async () => ({ id_usuario: "other", conteudo: "[NOTIFICACAO:convite] teste" });
  prisma.chat.delete = async () => { deleted = true; };
  try {
    const res = response();
    await responderSolicitacao({ params: { id: "test" }, usuario: { id_usuario: "me" } }, res);
    assert.equal(res.statusCode, 403);
    assert.equal(deleted, false);
  } finally {
    prisma.chat.findUnique = originalFind;
    prisma.chat.delete = originalDelete;
    await prisma.$disconnect();
  }
});
