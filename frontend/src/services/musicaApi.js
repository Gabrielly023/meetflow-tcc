// Implementação REAL (Axios) da lista colaborativa de músicas do evento.
// Espelha as funções de músicas de playlistService.js.
// Só é usada quando USE_API.playlists === true (ver config.js).
// Rotas esperadas: ver CONTRATO_API_FRONTEND.md (§4.4).

import { api } from "./config";
import { musicaDaApi } from "./adapters";

// Lista as músicas do evento (o backend já devolve ordenadas por votos).
export async function listarMusicas(eventId) {
  const { data } = await api.get(`/eventos/${eventId}/musicas`);
  return (data || []).map(musicaDaApi);
}

// Adiciona uma música a partir de um link do Spotify.
// Mantém o mesmo retorno do mock: { musica } ou { erro: "invalido" | "duplicada" }.
export async function adicionarMusica(eventId, entrada) {
  try {
    const { data } = await api.post(`/eventos/${eventId}/musicas`, {
      link_spotify: String(entrada || "").trim(),
    });
    return { musica: musicaDaApi(data) };
  } catch (erro) {
    if (erro?.response?.status === 409) return { erro: "duplicada" };
    return { erro: "invalido" };
  }
}

// Alterna o voto do usuário logado (curtir / descurtir).
export async function curtirMusica(_eventId, musicaId) {
  await api.post(`/musicas/${musicaId}/voto`);
}

// Remove uma música (o backend valida se o logado é o dono).
export async function removerMusica(_eventId, musicaId) {
  try {
    await api.delete(`/musicas/${musicaId}`);
    return true;
  } catch {
    return false;
  }
}
