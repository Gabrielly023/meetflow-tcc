import { api } from "./config";

// Lista as playlists do evento
export async function listarPlaylist(eventId) {
  const { data } = await api.get(`/eventos/${eventId}/playlist`);

  return data?.playlist_spotify || [];
}

// Adiciona uma playlist/link ao evento
export async function adicionarPlaylist(eventId, linkSpotify) {
  const { data } = await api.post(`/eventos/${eventId}/playlist`, {
    link_spotify: linkSpotify,
  });

  return data?.playlist_spotify || [];
}

// Atualiza um link existente
export async function atualizarPlaylist(eventId, linkAntigo, linkNovo) {
  const { data } = await api.put(`/eventos/${eventId}/playlist`, {
    link_antigo: linkAntigo,
    link_novo: linkNovo,
  });

  return data?.playlist_spotify || [];
}

// Remove um link da playlist
export async function removerPlaylist(eventId, linkSpotify) {
  const { data } = await api.delete(`/eventos/${eventId}/playlist`, {
    data: {
      link_spotify: linkSpotify,
    },
  });

  return data?.playlist_spotify || [];
}