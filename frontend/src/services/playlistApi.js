import { api } from "./config";
import { musicaDaApi } from "./adapters";

export async function listarMusicas(eventId) {
  const { data } = await api.get(`/eventos/${eventId}/musicas`);
  return (data || []).map(musicaDaApi);
}

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

export async function curtirMusica(_eventId, musicaId) {
  await api.post(`/musicas/${musicaId}/voto`);
}

export async function removerMusica(_eventId, musicaId) {
  try {
    await api.delete(`/musicas/${musicaId}`);
    return true;
  } catch {
    return false;
  }
}
