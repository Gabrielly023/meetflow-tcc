import { buscarEventoPorId, getUsuarioAtualId, isDono } from "./eventoService";

// "Backend falso" dos mapas de cada evento (persistido em localStorage).
// Qualquer participante pode adicionar um local (link do Google Maps OU do Waze)
// para os outros saberem onde o evento será. Espelha a lógica da galeria: cada
// local tem um dono; o dono (ou o organizador do evento) pode remover.
// Formato: { [eventId]: [ {id, label, embedUrl, linkUrl, provedor, ownerId} ] }
//   provedor: "google" | "waze" — define o rótulo/cor do botão "Abrir no ...".
// Quando o backend real existir, basta trocar o corpo por chamadas Axios.

const KEY = "meetflow.mapas";

function ler() {
  try {
    const bruto = localStorage.getItem(KEY);
    return bruto ? JSON.parse(bruto) : {};
  } catch (erro) {
    console.error("Erro ao ler mapas:", erro);
    return {};
  }
}

function salvar(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar o mapa:", erro);
    return false;
  }
}

// Monta uma URL de INCORPORAÇÃO (embed) do Google Maps a partir de uma
// consulta (endereço ou coordenadas). Não precisa de chave de API.
function embedDeConsulta(consulta, zoom) {
  const z = zoom ? `&z=${zoom}` : "";
  return `https://www.google.com/maps?q=${encodeURIComponent(consulta)}${z}&output=embed`;
}

// Monta o link "normal" do Google Maps (para abrir no app/site) a partir de
// uma consulta.
function linkDeConsulta(consulta) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

// Tenta derivar um link "normal" a partir de uma URL de embed.
function linkDeEmbed(embed) {
  const mQ = embed.match(/[?&]q=([^&]+)/i);
  if (mQ) return linkDeConsulta(decodeURIComponent(mQ[1].replace(/\+/g, " ")));
  // Embeds oficiais (pb=...) trazem as coordenadas como !3d<lat>!2d<lng>
  const lat = embed.match(/!3d(-?\d+(?:\.\d+)?)/);
  const lng = embed.match(/!2d(-?\d+(?:\.\d+)?)/);
  if (lat && lng) return linkDeConsulta(`${lat[1]},${lng[1]}`);
  return "https://www.google.com/maps";
}

// ───────────────────────── WAZE ─────────────────────────
// O Waze tem um embed oficial e gratuito (embed.waze.com), mas ele só aceita
// COORDENADAS (lat/lng) — não aceita endereço nem link encurtado. Por isso:
//   • link do Waze com coordenadas  -> prévia embutida + botão "Abrir no Waze";
//   • link encurtado / por endereço -> sem prévia, só o botão "Abrir no Waze"
//     (mesmo comportamento que os links encurtados do Google já têm hoje).

// Mapa de INCORPORAÇÃO (embed) do Waze a partir de coordenadas.
function embedWazeDeCoords(lat, lng, zoom) {
  return `https://embed.waze.com/iframe?zoom=${zoom || 17}&lat=${lat}&lon=${lng}`;
}

// Link "normal" do Waze (abre o app/site) a partir de coordenadas.
function linkWazeDeCoords(lat, lng) {
  return `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
}

// Link de busca do Waze a partir de um endereço/consulta (sem prévia).
function linkWazeDeConsulta(consulta) {
  return `https://waze.com/ul?q=${encodeURIComponent(consulta)}&navigate=yes`;
}

// Converte um endereço/nome de local em coordenadas usando o Nominatim
// (OpenStreetMap): serviço gratuito e sem chave de API. Usamos para montar a
// prévia do Waze (que só aceita lat/lon) quando o link colado não traz
// coordenadas. Retorna { lat, lng } ou null se não encontrar / falhar.
// Obs.: uso leve (política do Nominatim pede ~1 req/s); ideal para um app de
// baixo volume. O navegador não deixa definir User-Agent, mas envia o Referer.
async function geocodificar(consulta) {
  const q = String(consulta || "").trim();
  if (!q) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    if (!resp.ok) return null;
    const dados = await resp.json();
    if (!Array.isArray(dados) || dados.length === 0) return null;
    const { lat, lon } = dados[0];
    if (!lat || !lon) return null;
    return { lat, lng: lon };
  } catch (erro) {
    console.error("Falha ao geocodificar endereço:", erro);
    return null;
  }
}

// Tenta extrair coordenadas "lat,lng" de um texto (link do Waze/Google ou
// coordenadas digitadas). Retorna [lat, lng] ou null.
function coordsDeTexto(texto) {
  // ?ll=lat,lng (Waze) — a vírgula pode vir codificada como %2C
  let m = texto.match(/[?&]ll=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/i);
  if (m) return [m[1], m[2]];
  // to=ll.lat,lng (Waze live-map / direções)
  m = texto.match(/to=ll\.(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (m) return [m[1], m[2]];
  // @lat,lng (links do Google Maps)
  m = texto.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (m) return [m[1], m[2]];
  // coordenadas puras "lat,lng"
  m = texto.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (m) return [m[1], m[2]];
  return null;
}

// Tenta extrair um endereço/nome de local de um texto (link do Google ou
// endereço digitado), para montar uma busca quando não há coordenadas.
function consultaDeTexto(texto) {
  const mPlace = texto.match(/\/place\/([^/@?#]+)/i);
  if (mPlace) return decodeURIComponent(mPlace[1]).replace(/\+/g, " ");
  const mQ = texto.match(/[?&](?:q|query|destination)=([^&]+)/i);
  if (mQ) return decodeURIComponent(mQ[1].replace(/\+/g, " "));
  if (!/^https?:\/\//i.test(texto) && texto.length >= 3) return texto;
  return null;
}

// Normaliza uma entrada para um local do Waze { embedUrl, linkUrl, provedor }.
// Retorna null se não conseguir montar nem coordenadas nem uma busca.
function normalizarWaze(texto) {
  const coords = coordsDeTexto(texto);
  if (coords) {
    const [lat, lng] = coords;
    return {
      embedUrl: embedWazeDeCoords(lat, lng),
      linkUrl: linkWazeDeCoords(lat, lng),
      provedor: "waze",
    };
  }
  // Link do Waze sem coordenadas (encurtado, por nome de local, etc.): guarda
  // o link exato para o botão "abrir"; sem prévia embutida.
  if (/^https?:\/\//i.test(texto) && /waze\.com/i.test(texto)) {
    return { embedUrl: null, linkUrl: texto, provedor: "waze" };
  }
  // Endereço/consulta: monta uma busca do Waze. `consulta` fica guardada para
  // geocodificar depois e conseguir montar a prévia do Waze.
  const q = consultaDeTexto(texto);
  if (q) {
    return {
      embedUrl: null,
      linkUrl: linkWazeDeConsulta(q),
      provedor: "waze",
      consulta: q,
    };
  }
  return null;
}

// Converte o que o usuário colou em { embedUrl, linkUrl, provedor }.
// - `provedor` ("google" | "waze") é o app escolhido pelo usuário no formulário.
//   Um link que já é do Waze é sempre tratado como Waze, mesmo que a escolha
//   diga outra coisa; nos demais casos, respeitamos a escolha.
// Aceita: código <iframe ...>, URL de embed, link do Google Maps (com @lat,lng,
// /place/nome ou ?q=...) ou do Waze (com ll=..., /ul/...), links encurtados
// (só abrir), ou endereço/coords puros.
// embedUrl pode ser null quando não dá para gerar prévia (ex.: link encurtado).
// Retorna null se não parecer um local válido.
export function normalizarMapa(entrada, provedor = "google") {
  if (!entrada) return null;
  let texto = String(entrada).trim();

  // Código <iframe ... src="URL"> → usa o src
  const mIframe = texto.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (mIframe) texto = mIframe[1];

  // Waze: quando o usuário escolheu Waze OU quando o link já é do Waze.
  if (provedor === "waze" || /waze\.com/i.test(texto)) {
    const waze = normalizarWaze(texto);
    if (waze) return waze;
  }

  // Já é uma URL de incorporação do Google Maps
  if (/\/maps\/embed/i.test(texto) || /[?&]output=embed/i.test(texto)) {
    return { embedUrl: texto, linkUrl: linkDeEmbed(texto), provedor: "google" };
  }

  // Link com coordenadas "@lat,lng"
  const mAt = texto.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (mAt) {
    const q = `${mAt[1]},${mAt[2]}`;
    return {
      embedUrl: embedDeConsulta(q, 16),
      linkUrl: /^https?:\/\//i.test(texto) ? texto : linkDeConsulta(q),
      provedor: "google",
    };
  }

  // Link com "/place/<nome>"
  const mPlace = texto.match(/\/place\/([^/@?#]+)/i);
  if (mPlace) {
    const q = decodeURIComponent(mPlace[1]).replace(/\+/g, " ");
    return { embedUrl: embedDeConsulta(q), linkUrl: texto, provedor: "google" };
  }

  // Link com "?q=" / "?query=" / "?destination="
  const mQ = texto.match(/[?&](?:q|query|destination)=([^&]+)/i);
  if (mQ) {
    const q = decodeURIComponent(mQ[1].replace(/\+/g, " "));
    return { embedUrl: embedDeConsulta(q), linkUrl: texto, provedor: "google" };
  }

  // Link do Google Maps que não dá para extrair no navegador (ex.: encurtado
  // maps.app.goo.gl). Guardamos para o botão "abrir"; sem prévia embutida.
  if (/^https?:\/\//i.test(texto) && /(goo\.gl|google\.[^/]+\/maps)/i.test(texto)) {
    return { embedUrl: null, linkUrl: texto, provedor: "google" };
  }

  // Endereço ou coordenadas digitados diretamente
  if (!/^https?:\/\//i.test(texto) && texto.length >= 3) {
    return {
      embedUrl: embedDeConsulta(texto),
      linkUrl: linkDeConsulta(texto),
      provedor: "google",
    };
  }

  return null;
}

// Gera um mapa a partir de um texto livre (ex.: o campo "local" do evento),
// para servir de prévia padrão quando ninguém adicionou um local ainda.
export function mapaDoTexto(texto) {
  if (!texto || !String(texto).trim()) return null;
  const t = String(texto).trim();
  return {
    embedUrl: embedDeConsulta(t),
    linkUrl: linkDeConsulta(t),
    provedor: "google",
  };
}

// Lista os locais adicionados a um evento.
export function listarLocais(eventId) {
  return ler()[eventId] || [];
}

// O primeiro local (usado como "principal" na prévia do evento e, no futuro,
// na página geral de mapas).
export function getLocalPrincipal(eventId) {
  return listarLocais(eventId)[0] || null;
}

// Diz se o local foi adicionado pelo usuário atual.
export function isDonoLocal(local) {
  return Boolean(local && local.ownerId === getUsuarioAtualId());
}

// Pode remover quem adicionou o local OU o organizador do evento (moderação).
export function podeRemoverLocal(eventId, local) {
  if (isDonoLocal(local)) return true;
  return isDono(buscarEventoPorId(eventId));
}

// Adiciona um local a partir de um link/consulta do Google Maps ou do Waze.
// `provedor` ("google" | "waze") é o app escolhido no formulário.
// É assíncrona porque, no Waze sem coordenadas, geocodifica o endereço para
// montar a prévia (ver geocodificar()).
// Retorna { local } em sucesso, ou { erro: "invalido" | "duplicado" }.
export async function adicionarLocal(eventId, entrada, label, provedor = "google") {
  const norm = normalizarMapa(entrada, provedor);
  if (!norm || (!norm.embedUrl && !norm.linkUrl)) return { erro: "invalido" };

  const todos = ler();
  const lista = todos[eventId] || [];

  if (
    lista.some(
      (l) => l.linkUrl === norm.linkUrl && l.embedUrl === norm.embedUrl,
    )
  ) {
    return { erro: "duplicado" };
  }

  const rotulo = (label || "").trim() || "Local do evento";

  // Se o link não gera prévia, tentamos montar o mapa a partir de um texto:
  // o endereço embutido no link, senão o NOME do local digitado, senão o
  // endereço cadastrado do evento. O linkUrl continua sendo o link exato.
  let embedUrl = norm.embedUrl;
  if (!embedUrl) {
    const alvo =
      norm.consulta ||
      (rotulo.toLowerCase() !== "local do evento" ? rotulo : null) ||
      buscarEventoPorId(eventId)?.local ||
      null;

    if (norm.provedor === "waze") {
      // O embed do Waze só aceita coordenadas: geocodificamos o endereço.
      if (alvo) {
        const coords = await geocodificar(alvo);
        if (coords) embedUrl = embedWazeDeCoords(coords.lat, coords.lng);
      }
    } else if (alvo) {
      // O Google geocodifica sozinho no embed (?q=endereço).
      embedUrl = embedDeConsulta(alvo);
    }
  }

  const local = {
    id:
      globalThis.crypto?.randomUUID?.() ||
      `map-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    label: rotulo,
    embedUrl: embedUrl || null,
    linkUrl: norm.linkUrl || null,
    provedor: norm.provedor || "google",
    ownerId: getUsuarioAtualId(),
  };

  todos[eventId] = [...lista, local];
  salvar(todos);
  return { local };
}

// Remove um local (só o dono do local ou o organizador do evento).
export function removerLocal(eventId, localId) {
  const todos = ler();
  const lista = todos[eventId] || [];
  const alvo = lista.find((l) => l.id === localId);
  if (!alvo || !podeRemoverLocal(eventId, alvo)) return false;

  todos[eventId] = lista.filter((l) => l.id !== localId);
  salvar(todos);
  return true;
}
