// Implementação REAL (Axios) do chat do evento.
// Só é usada quando USE_API.chat === true (ver config.js).
// Rotas esperadas: ver CONTRATO_API_FRONTEND.md (§4.5).
//
// OBS: hoje o chat vive dentro do próprio evento (campo `messages` do mock),
// não há um "chatService" separado no frontend. Estas funções ficam prontas
// para quando o chat virar uma entidade própria consumida pelo componente
// EventChat.

import { api } from "./config";
import { mensagemDaApi } from "./adapters";
import { getUsuarioAtualId } from "./eventoService";

// Lista as mensagens do evento.
export async function listarMensagens(eventId) {
  const { data } = await api.get(`/eventos/${eventId}/chat`);
  const uid = getUsuarioAtualId();
  return (data || []).map((c) => mensagemDaApi(c, uid));
}

// Envia uma mensagem (o autor é o usuário logado, definido pelo token).
export async function enviarMensagem(eventId, texto) {
  const { data } = await api.post(`/eventos/${eventId}/chat`, {
    conteudo: texto,
    tipo: "mensagem",
  });
  return mensagemDaApi(data, getUsuarioAtualId());
}
