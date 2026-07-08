// Implementação REAL (Axios) dos eventos. Espelha a assinatura das funções
// de eventoService.js, mas conversa com o backend Express.
// Só é usada quando USE_API.eventos === true (ver config.js).
// Rotas esperadas: ver CONTRATO_API_FRONTEND.md (§4.1).

import { api } from "./config";
import { eventoDaApi, eventoParaApi } from "./adapters";

export async function listarEventos() {
  const { data } = await api.get("/eventos");
  return (data || []).map(eventoDaApi);
}

export async function buscarEventoPorId(id) {
  const { data } = await api.get(`/eventos/${id}`);
  return eventoDaApi(data);
}

export async function criarEvento(dados) {
  const { data } = await api.post("/eventos", eventoParaApi(dados));
  return eventoDaApi(data);
}

export async function atualizarEvento(id, dados) {
  const { data } = await api.put(`/eventos/${id}`, eventoParaApi(dados));
  return eventoDaApi(data);
}

export async function excluirEvento(id) {
  await api.delete(`/eventos/${id}`);
  return true;
}

// "Sair" de um evento = remover o usuário logado da lista de participantes.
export async function sairDoEvento(id) {
  await api.delete(`/eventos/${id}/participantes/me`);
  return true;
}
