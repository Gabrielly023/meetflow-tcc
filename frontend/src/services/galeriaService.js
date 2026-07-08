import { buscarEventoPorId, getUsuarioAtualId } from "./eventoService";
import { USE_API } from "./config";
import * as galeriaApi from "./galeriaApi";

// "Backend falso" da galeria de cada evento (persistido em localStorage).
// Cada foto tem um dono (quem enviou). Regras:
// - qualquer participante pode remover uma foto SÓ para si (esconde);
// - "excluir para todos" só aparece/funciona para o dono da foto.

const KEY_ADD = "meetflow.galeria.adicionadas"; // { [eventId]: [ {id,url,ownerId} ] }
const KEY_OCULTAS = "meetflow.galeria.ocultas"; // [fotoId] escondidas p/ o usuário atual
const KEY_EXCLUIDAS = "meetflow.galeria.excluidas"; // [fotoId] excluídas para todos (seed)
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
  return Boolean(foto && foto.ownerId === getUsuarioAtualId());
}

// Fotos originais do evento (vêm do campo images do evento)
function fotosSeed(evento) {
  if (!evento) return [];
  return (evento.images || []).map((url, i) => ({
    id: `${evento.id}-seed-${i}`,
    url,
    ownerId: evento.ownerId || "outro",
  }));
}

// Lista as fotos visíveis para o usuário atual, na ordem definida
export function listarFotos(eventId) {
  if (USE_API.galeria) return galeriaApi.listarFotos(eventId);
  const evento = buscarEventoPorId(eventId);
  const adicionadas = ler(KEY_ADD, {})[eventId] || [];
  const excluidas = ler(KEY_EXCLUIDAS, []);
  const ocultas = ler(KEY_OCULTAS, []);

  let todas = [...fotosSeed(evento), ...adicionadas].filter(
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

  return todas;
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
    return galeriaApi.adicionarFotos(eventId, arquivos, arquivoParaDataUrl);
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

// Exclui a foto para todos — só o dono da foto pode.
// Não apaga de vez: vai para a lixeira (pode ser restaurada).
export function excluirParaTodos(foto) {
  if (USE_API.galeria) return galeriaApi.excluirParaTodos(foto);
  if (!isDonoFoto(foto)) return false;
  const excluidas = ler(KEY_EXCLUIDAS, []);
  if (!excluidas.includes(foto.id)) {
    salvar(KEY_EXCLUIDAS, [...excluidas, foto.id]);
  }
  return true;
}

// Lista o que está na lixeira do evento para o usuário atual:
// - fotos que ELE removeu só para si (motivo "mim");
// - fotos que ELE (dono) excluiu para todos (motivo "todos").
export function listarLixeira(eventId) {
  const evento = buscarEventoPorId(eventId);
  const adicionadas = ler(KEY_ADD, {})[eventId] || [];
  const excluidas = ler(KEY_EXCLUIDAS, []);
  const ocultas = ler(KEY_OCULTAS, []);
  const todas = [...fotosSeed(evento), ...adicionadas];

  return todas
    .map((foto) => {
      if (excluidas.includes(foto.id) && isDonoFoto(foto)) {
        return { ...foto, motivo: "todos" };
      }
      if (ocultas.includes(foto.id)) {
        return { ...foto, motivo: "mim" };
      }
      return null;
    })
    .filter(Boolean);
}

// Restaura uma foto da lixeira (volta a aparecer)
export function restaurar(foto) {
  const ocultas = ler(KEY_OCULTAS, []);
  if (ocultas.includes(foto.id)) {
    salvar(
      KEY_OCULTAS,
      ocultas.filter((x) => x !== foto.id),
    );
  }
  const excluidas = ler(KEY_EXCLUIDAS, []);
  if (excluidas.includes(foto.id)) {
    salvar(
      KEY_EXCLUIDAS,
      excluidas.filter((x) => x !== foto.id),
    );
  }
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
export function getVotosFoto(fotoId) {
  const votos = ler(KEY_VOTOS, {});
  return (votos[fotoId] || []).length;
}

// Diz se o usuário atual já curtiu essa foto.
export function usuarioCurtiuFoto(fotoId) {
  const votos = ler(KEY_VOTOS, {});
  return (votos[fotoId] || []).includes(getUsuarioAtualId());
}

// Alterna a curtida do usuário atual em uma foto (curtir / descurtir).
export function curtirFoto(fotoId) {
  const uid = getUsuarioAtualId();
  const votos = ler(KEY_VOTOS, {});
  const lista = votos[fotoId] || [];
  votos[fotoId] = lista.includes(uid)
    ? lista.filter((v) => v !== uid)
    : [...lista, uid];
  salvar(KEY_VOTOS, votos);
}
