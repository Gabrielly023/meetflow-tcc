import { api } from "./config";

export async function buscarNotificacoesDoUsuario(usuarioId) {
  try {
    const { data } = await api.get(`/notificacoes/${usuarioId}`);
    return data;
  } catch (error) {
    console.error("Erro no notificacaoService:", error);
    return [];
  }
}

export async function responderSolicitacaoApi(notificacaoId, aprovado) {
  try {
    await api.patch(`/notificacoes/${notificacaoId}/responder`, { aprovado });
    return true;
  } catch (error) {
    console.error("Erro ao responder notificacao:", error);
    return false;
  }
}
