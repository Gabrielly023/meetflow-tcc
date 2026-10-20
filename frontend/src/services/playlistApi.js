import { api } from "./config";

export async function listarPlaylist(eventId) {
  const { data } = await api.get(`/eventos/${eventId}/playlist`);
  return data?.playlist_spotify || [];
}

export async function adicionarPlaylist(eventId, linkSpotify) {
  const { data } = await api.post(`/eventos/${eventId}/playlist`, {
    link_spotify: linkSpotify,
  });

  return data?.playlist_spotify || [];
}

export async function atualizarPlaylist(eventId, linkAntigo, linkNovo) {
  const { data } = await api.put(`/eventos/${eventId}/playlist`, {
    link_antigo: linkAntigo,
    link_novo: linkNovo,
  });

  return data?.playlist_spotify || [];
}

export async function removerPlaylist(eventId, linkSpotify) {
  const { data } = await api.delete(`/eventos/${eventId}/playlist`, {
    data: { link_spotify: linkSpotify },
  });

  return data?.playlist_spotify || [];
}