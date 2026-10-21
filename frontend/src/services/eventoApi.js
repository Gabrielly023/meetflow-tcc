// Implementação REAL (Axios) dos eventos. Espelha a assinatura das funções
// de eventoService.js, mas conversa com o backend Express.
// Só é usada quando USE_API.eventos === true (ver config.js).
// Rotas esperadas: ver CONTRATO_API_FRONTEND.md (§4.1).

import { api } from "./config";
import { eventoDaApi, eventoParaApi } from "./adapters";

async function prepararDadosEvento(dados) {
  const payload = eventoParaApi(dados);
  if (!payload.capa_url?.startsWith("data:")) return payload;

  const resposta = await fetch(payload.capa_url);
  const imagem = await resposta.blob();
  const extensao = imagem.type === "image/png" ? "png" : "jpg";
  const formulario = new FormData();

  Object.entries(payload).forEach(([campo, valor]) => {
    if (campo !== "capa_url" && valor !== null && valor !== undefined) {
      formulario.append(campo, String(valor));
    }
  });
  formulario.append("capa", imagem, `capa.${extensao}`);
  return formulario;
}

export async function listarEventos() {
  const { data } = await api.get("/eventos");
  return (data || []).map(eventoDaApi);
}

export async function listarLixeiraEventos() {
  const { data } = await api.get("/eventos/lixeira");
  return (data || []).map((evento) => ({
    ...eventoDaApi(evento),
    motivo: "excluido",
  }));
}

export async function buscarEventoPorId(id) {
  const { data } = await api.get(`/eventos/${id}`);
  return eventoDaApi(data);
}

export async function criarEvento(dados) {
  const { data } = await api.post("/eventos", await prepararDadosEvento(dados));
  return eventoDaApi(data);
}

export async function atualizarEvento(id, dados) {
  const { data } = await api.put(
    `/eventos/${id}`,
    await prepararDadosEvento(dados),
  );
  return eventoDaApi(data);
}

export async function excluirEvento(id) {
  await api.delete(`/eventos/${id}`);
  return true;
}

export async function restaurarEvento(id) {
  await api.patch(`/eventos/${id}/restaurar`);
  return true;
}

export async function excluirEventoPermanentemente(id) {
  await api.delete(`/eventos/${id}/permanente`);
  return true;
}

// "Sair" de um evento = remover o usuário logado da lista de participantes.
export async function sairDoEvento(id) {
  await api.delete(`/eventos/${id}/participantes/me`);
  return true;
}
