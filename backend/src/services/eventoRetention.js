import { prisma } from "../config/db.js";

export const DIAS_RETENCAO_EVENTO = 30;
export const INTERVALO_LIMPEZA_EVENTOS_MS = 24 * 60 * 60 * 1000;

export async function excluirEventosExpirados() {
  const limite = new Date(
    Date.now() - DIAS_RETENCAO_EVENTO * 24 * 60 * 60 * 1000,
  );
  const resultado = await prisma.evento.deleteMany({
    where: {
      excluido_em: { lte: limite },
    },
  });

  return resultado.count;
}
