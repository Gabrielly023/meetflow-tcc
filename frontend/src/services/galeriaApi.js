// Implementação REAL (Axios) da galeria de fotos do evento.
// Espelha as funções principais de galeriaService.js.
// Só é usada quando USE_API.galeria === true (ver config.js).
// Rotas esperadas: ver CONTRATO_API_FRONTEND.md (§4.3).

import { api } from "./config";
import { fotoDaApi } from "./adapters";

// Lista as fotos do evento.
export async function listarFotos(eventId) {
  const { data } = await api.get(`/eventos/${eventId}/galeria`);
  return (data || []).map(fotoDaApi);
}

export async function listarLixeira(eventId) {
  const { data } = await api.get(`/eventos/${eventId}/galeria/lixeira`);
  return (data || []).map(fotoDaApi);
}

// Envia fotos do dispositivo. O mock reduz a imagem para uma data URL;
// aqui reaproveitamos essa conversão e mandamos a url_foto para o backend.
// Retorna quantas fotos foram adicionadas com sucesso.

export async function adicionarFotos(eventId, arquivos) {
  const imagens = Array.from(arquivos).filter((arquivo) =>
    arquivo.type.startsWith("image/")
  );

  let enviadas = 0;

  for (const arquivo of imagens) {
    const formData = new FormData();
    formData.append("foto", arquivo);

    try {
      await api.post(`/eventos/${eventId}/galeria`, formData);
      enviadas++;
    } catch (erro) {
      console.error("Falha ao enviar foto:", erro);
      console.error("Resposta do backend:", erro.response?.data);
    }
  }

  return enviadas;
}


// Exclui a foto para todos (o backend valida se o logado é o dono da foto).
export async function excluirParaTodos(foto) {
  await api.delete(`/galeria/${foto.id}`);
  return true;
}

export async function restaurar(foto) {
  await api.patch(`/galeria/${foto.id}/restaurar`);
}

export async function excluirPermanentemente(foto) {
  await api.delete(`/galeria/${foto.id}/permanente`);
}


export async function curtirFoto(fotoId) {
  const { data } = await api.post(`/galeria/${fotoId}/curtir`);
  return data;
}
