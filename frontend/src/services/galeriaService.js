import { buscarEventoPorId, getUsuarioAtualId } from "./eventoService";
import { getUsuarioLogado } from "./usuarioService";
import { USE_API } from "./config";
import * as galeriaApi from "./galeriaApi";

// "Backend falso" da galeria de cada evento (persistido em localStorage).
// Cada foto tem um dono (quem enviou). Regras:
// - qualquer participante pode remover uma foto SÓ para si (esconde);
// - "excluir para todos" só aparece/funciona para o dono da foto.

const KEY_ADD = "meetflow.galeria.adicionadas"; // { [eventId]: [ {id,url,ownerId} ] }
const KEY_OCULTAS = "meetflow.galeria.ocultas"; // [fotoId] escondidas p/ o usuário atual
const KEY_EXCLUIDAS = "meetflow.galeria.excluidas"; // [fotoId] excluídas para todos (seed)
const KEY_PERMANENTES = "meetflow.galeria.permanentes";
const KEY_ORDEM = "meetflow.galeria.ordem"; // { [eventId]: [fotoId] }
const KEY_VOTOS = "meetflow.galeria.votos"; // { [fotoId]: [userId] } curtidas por foto

function ler(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch (erro) {
    console.error("Erro ao ler galeria:", erro);
    return padrao;
  }
}

function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar a galeria:", erro);
    return false;
  }
}

export function isDonoFoto(foto) {
  const idUsuarioLogado = getUsuarioLogado()?.id_usuario;
  const idsUsuario = [idUsuarioLogado, getUsuarioAtualId()]
    .filter(Boolean)
    .map(String);

  return Boolean(foto?.ownerId && idsUsuario.includes(String(foto.ownerId)));
}

// Fotos originais do evento (vêm do campo images do evento)
function fotosSeed(evento) {
  if (!evento) return [];
  const permanentes = ler(KEY_PERMANENTES, []);
  return (evento.images || []).map((url, i) => ({
    id: `${evento.id}-seed-${i}`,
    url,
    ownerId: evento.ownerId || "outro",
  })).filter((foto) => !permanentes.includes(foto.id));
}

// Lista as fotos visíveis para o usuário atual, na ordem definida

export async function listarFotos(eventId) {
  let todas;

  if (USE_API.galeria) {
    todas = await galeriaApi.listarFotos(eventId);
  } else {
    const evento = buscarEventoPorId(eventId);
    const adicionadas = ler(KEY_ADD, {})[eventId] || [];
    const excluidas = ler(KEY_EXCLUIDAS, []);
    const ocultas = ler(KEY_OCULTAS, []);

    todas = [...fotosSeed(evento), ...adicionadas].filter(
      (foto) => !excluidas.includes(foto.id) && !ocultas.includes(foto.id),
    );

    const ordem = ler(KEY_ORDEM, {})[eventId];
    if (ordem) {
      const posicao = (id) => {
        const p = ordem.indexOf(id);
        return p === -1 ? Number.MAX_SAFE_INTEGER : p;
      };
      todas = [...todas].sort((a, b) => posicao(a.id) - posicao(b.id));
    }
  }

  // Também oculta fotos vindas do backend.
  const ocultas = ler(KEY_OCULTAS, []);
  return todas.filter((foto) => !ocultas.includes(foto.id));
}


// Reduz a imagem antes de guardar (mock: evita estourar o localStorage)
function arquivoParaDataUrl(arquivo, maxLado = 1200) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Falha ao carregar a imagem"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxLado || height > maxLado) {
          const escala = maxLado / Math.max(width, height);
          width = Math.round(width * escala);
          height = Math.round(height * escala);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

// Adiciona fotos do dispositivo do usuário (dono = usuário atual)
export async function adicionarFotos(eventId, arquivos) {
  if (USE_API.galeria)
    return galeriaApi.adicionarFotos(eventId, arquivos);
  const imagens = Array.from(arquivos).filter((a) => a.type.startsWith("image/"));
  const ownerId = getUsuarioAtualId();
  const novas = [];

  for (let i = 0; i < imagens.length; i++) {
    try {
      const url = await arquivoParaDataUrl(imagens[i]);
      novas.push({ id: `${eventId}-add-${Date.now()}-${i}`, url, ownerId });
    } catch (erro) {
      console.error(erro);
    }
  }

  const todas = ler(KEY_ADD, {});
  todas[eventId] = [...(todas[eventId] || []), ...novas];
  salvar(KEY_ADD, todas);
  return novas.length;
}

// Remove uma foto só para o usuário atual (continua para os outros)
export function removerParaMim(fotoId) {
  const ocultas = ler(KEY_OCULTAS, []);
  if (!ocultas.includes(fotoId)) {
    salvar(KEY_OCULTAS, [...ocultas, fotoId]);
  }
}

function removerOcultacao(fotoId) {
  const ocultas = ler(KEY_OCULTAS, []);
  if (ocultas.includes(fotoId)) {
    salvar(KEY_OCULTAS, ocultas.filter((id) => id !== fotoId));
  }
}


export async function listarFotosOcultas(eventId) {
  let todas;

  if (USE_API.galeria) {
    todas = await galeriaApi.listarFotos(eventId);
  } else {
    const evento = buscarEventoPorId(eventId);
    const adicionadas = ler(KEY_ADD, {})[eventId] || [];
    todas = [...fotosSeed(evento), ...adicionadas];
  }

  const ocultas = ler(KEY_OCULTAS, []);
  return todas.filter((foto) => ocultas.includes(foto.id));
}


// Exclui a foto para todos — só o dono da foto pode.
// Não apaga de vez: vai para a lixeira (pode ser restaurada).
export function excluirParaTodos(foto) {
  if (!isDonoFoto(foto)) return false;
  if (USE_API.galeria) return galeriaApi.excluirParaTodos(foto);
  const excluidas = ler(KEY_EXCLUIDAS, []);
  if (!excluidas.includes(foto.id)) {
    salvar(KEY_EXCLUIDAS, [...excluidas, foto.id]);
  }
  return true;
}

// Lista o que está na lixeira do evento para o usuário atual:
// - fotos que ELE removeu só para si (motivo "mim");
// - fotos que ELE (dono) excluiu para todos (motivo "todos").

export async function listarLixeira(eventId) {
  let todas;
  let excluidasNoBackend = [];

  if (USE_API.galeria) {
    [todas, excluidasNoBackend] = await Promise.all([
      galeriaApi.listarFotos(eventId),
      galeriaApi.listarLixeira(eventId),
    ]);
  } else {
    const evento = buscarEventoPorId(eventId);
    const adicionadas = ler(KEY_ADD, {})[eventId] || [];
    todas = [...fotosSeed(evento), ...adicionadas];
  }

  const excluidas = ler(KEY_EXCLUIDAS, []);
  const ocultas = ler(KEY_OCULTAS, []);

  const removidasParaMim = todas
    .map((foto) => {
      if (ocultas.includes(foto.id)) {
        return { ...foto, motivo: "mim" };
      }
      return null;
    })
    .filter(Boolean);

  const removidasParaTodos = USE_API.galeria
    ? excluidasNoBackend.map((foto) => ({ ...foto, motivo: "todos" }))
    : todas
        .filter((foto) => excluidas.includes(foto.id) && isDonoFoto(foto))
        .map((foto) => ({ ...foto, motivo: "todos" }));
  const idsRemovidasParaTodos = new Set(
    removidasParaTodos.map((foto) => foto.id),
  );

  return [
    ...removidasParaTodos,
    ...removidasParaMim.filter((foto) => !idsRemovidasParaTodos.has(foto.id)),
  ];
}


// Restaura uma foto da lixeira (volta a aparecer)
export async function restaurar(foto) {
  if (foto.motivo === "todos" && USE_API.galeria) {
    await galeriaApi.restaurar(foto);
    return;
  }

  removerOcultacao(foto.id);
  const excluidas = ler(KEY_EXCLUIDAS, []);
  if (excluidas.includes(foto.id)) {
    salvar(
      KEY_EXCLUIDAS,
      excluidas.filter((x) => x !== foto.id),
    );
  }
}

export async function excluirPermanentemente(foto) {
  if (foto.motivo === "todos" && USE_API.galeria) {
    if (!isDonoFoto(foto)) {
      throw new Error("Apenas quem enviou a foto pode excluí-la permanentemente.");
    }
    await galeriaApi.excluirPermanentemente(foto);
  } else if (foto.motivo === "todos") {
    const excluidas = ler(KEY_EXCLUIDAS, []);
    salvar(KEY_EXCLUIDAS, excluidas.filter((id) => id !== foto.id));
    salvar(KEY_PERMANENTES, [...ler(KEY_PERMANENTES, []), foto.id]);

    const adicionadas = ler(KEY_ADD, {});
    Object.keys(adicionadas).forEach((eventId) => {
      adicionadas[eventId] = adicionadas[eventId].filter(
        (adicionada) => adicionada.id !== foto.id,
      );
    });
    salvar(KEY_ADD, adicionadas);
  }

  removerOcultacao(foto.id);
}

// Salva a nova ordem das fotos do evento
export function reordenar(eventId, idsNaOrdem) {
  const ordem = ler(KEY_ORDEM, {});
  ordem[eventId] = idsNaOrdem;
  salvar(KEY_ORDEM, ordem);
}

//
// CURTIDAS (likes) das fotos — cada usuário pode curtir/descurtir cada foto.
//

// Quantidade de curtidas de uma foto.

export function getVotosFoto(fotoId, fotos = []) {
  if (USE_API.galeria) {
    const foto = fotos.find((f) => f.id === fotoId);
    return foto?.curtidas?.length ?? 0;
  }

  const votos = ler(KEY_VOTOS, {});
  return (votos[fotoId] || []).length;
}


// Diz se o usuário atual já curtiu essa foto.


export function usuarioCurtiuFoto(fotoId, fotos = []) {
  if (USE_API.galeria) {
    const foto = fotos.find((f) => f.id === fotoId);
    const usuarioId = getUsuarioAtualId();
    return foto?.curtidas?.includes(usuarioId) ?? false;
  }

  const votos = ler(KEY_VOTOS, {});
  return (votos[fotoId] || []).includes(getUsuarioAtualId());
}



// Alterna a curtida do usuário atual em uma foto (curtir / descurtir).

export async function curtirFoto(fotoId) {
  if (USE_API.galeria) {
    return galeriaApi.curtirFoto(fotoId);
  }

  const uid = getUsuarioAtualId();
  const votos = ler(KEY_VOTOS, {});
  const lista = votos[fotoId] || [];

  votos[fotoId] = lista.includes(uid)
    ? lista.filter((v) => v !== uid)
    : [...lista, uid];

  salvar(KEY_VOTOS, votos);
}
