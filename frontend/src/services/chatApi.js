// Implementação REAL (Axios) do chat do evento.
// Só é usada quando USE_API.chat === true (ver config.js).
// Espelha as assinaturas de chatService.js. Rotas: ver CONTRATO_API_FRONTEND.md (§4.5).

import { api } from "./config";
import { mensagemDaApi, mensagemParaApi } from "./adapters";
import { getUsuarioAtualId } from "./eventoService";

// Lista as mensagens do evento (ordenadas por data).
export async function listarMensagens(eventId) {
  const { data } = await api.get(`/eventos/${eventId}/chat`);
  const uid = getUsuarioAtualId();
  return (data || []).map((c) => mensagemDaApi(c, uid));
}

// Envia uma mensagem (o autor é o usuário logado, definido pelo token).
// opts: { tipo, imageUrl, replyTo }.
export async function enviarMensagem(eventId, texto, opts = {}) {
  const { data } = await api.post(
    `/eventos/${eventId}/chat`,
    mensagemParaApi(texto, opts),
  );
  return mensagemDaApi(data, getUsuarioAtualId());
}

// Edita o conteúdo de uma mensagem própria.
export async function editarMensagem(eventId, msgId, novoTexto) {
  await api.put(`/chat/${msgId}`, { conteudo: novoTexto });
  return true;
}

// Apaga uma mensagem (dono da mensagem ou organizador do evento).
export async function excluirMensagem(eventId, msgId) {
  await api.delete(`/chat/${msgId}`);
  return true;
}

// Alterna a reação (emoji) do usuário logado em uma mensagem.
export async function alternarReacao(eventId, msgId, emoji) {
  await api.post(`/chat/${msgId}/reacao`, { emoji });
  return true;
}

// Marca todas as mensagens do evento como lidas pelo usuário logado.
export async function marcarComoLidas(eventId) {
  await api.post(`/eventos/${eventId}/chat/lido`);
  return true;
}
