import { buscarEventoPorId, getUsuarioAtualId, isDono } from "./eventoService";

// "Backend falso" dos mapas de cada evento (persistido em localStorage).
// Qualquer participante pode adicionar um local (link do Google Maps) para os
// outros saberem onde o evento será. Espelha a lógica da galeria: cada local
// tem um dono; o dono (ou o organizador do evento) pode remover.
// Formato: { [eventId]: [ {id, label, embedUrl, linkUrl, ownerId} ] }
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

// Converte o que o usuário colou em { embedUrl, linkUrl }.
// Aceita: código <iframe ...>, URL de embed, link do Google Maps (com @lat,lng,
// /place/nome ou ?q=...), links encurtados (só abrir), ou endereço/coords puros.
// embedUrl pode ser null quando não dá para gerar prévia (ex.: link encurtado).
// Retorna null se não parecer um local válido.
export function normalizarMapa(entrada) {
  if (!entrada) return null;
  let texto = String(entrada).trim();

  // Código <iframe ... src="URL"> → usa o src
  const mIframe = texto.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (mIframe) texto = mIframe[1];

  // Já é uma URL de incorporação do Google Maps
  if (/\/maps\/embed/i.test(texto) || /[?&]output=embed/i.test(texto)) {
    return { embedUrl: texto, linkUrl: linkDeEmbed(texto) };
  }

  // Link com coordenadas "@lat,lng"
  const mAt = texto.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (mAt) {
    const q = `${mAt[1]},${mAt[2]}`;
    return {
      embedUrl: embedDeConsulta(q, 16),
      linkUrl: /^https?:\/\//i.test(texto) ? texto : linkDeConsulta(q),
    };
  }

  // Link com "/place/<nome>"
  const mPlace = texto.match(/\/place\/([^/@?#]+)/i);
  if (mPlace) {
    const q = decodeURIComponent(mPlace[1]).replace(/\+/g, " ");
    return { embedUrl: embedDeConsulta(q), linkUrl: texto };
  }

  // Link com "?q=" / "?query=" / "?destination="
  const mQ = texto.match(/[?&](?:q|query|destination)=([^&]+)/i);
  if (mQ) {
    const q = decodeURIComponent(mQ[1].replace(/\+/g, " "));
    return { embedUrl: embedDeConsulta(q), linkUrl: texto };
  }

  // Link do Google Maps que não dá para extrair no navegador (ex.: encurtado
  // maps.app.goo.gl). Guardamos para o botão "abrir"; sem prévia embutida.
  if (/^https?:\/\//i.test(texto) && /(goo\.gl|google\.[^/]+\/maps)/i.test(texto)) {
    return { embedUrl: null, linkUrl: texto };
  }

  // Endereço ou coordenadas digitados diretamente
  if (!/^https?:\/\//i.test(texto) && texto.length >= 3) {
    return { embedUrl: embedDeConsulta(texto), linkUrl: linkDeConsulta(texto) };
  }

  return null;
}

// Gera um mapa a partir de um texto livre (ex.: o campo "local" do evento),
// para servir de prévia padrão quando ninguém adicionou um local ainda.
export function mapaDoTexto(texto) {
  if (!texto || !String(texto).trim()) return null;
  const t = String(texto).trim();
  return { embedUrl: embedDeConsulta(t), linkUrl: linkDeConsulta(t) };
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

// Adiciona um local a partir de um link/consulta do Google Maps.
// Retorna { local } em sucesso, ou { erro: "invalido" | "duplicado" }.
export function adicionarLocal(eventId, entrada, label) {
  const norm = normalizarMapa(entrada);
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

  // Se o link não gera prévia (ex.: encurtado maps.app.goo.gl), tentamos montar
  // o mapa pelo NOME do local digitado; senão, pelo endereço cadastrado do
  // evento. O linkUrl continua sendo o link exato (para o botão "abrir").
  let embedUrl = norm.embedUrl;
  if (!embedUrl) {
    if (rotulo.toLowerCase() !== "local do evento") {
      embedUrl = embedDeConsulta(rotulo);
    } else {
      const ev = buscarEventoPorId(eventId);
      if (ev?.local) embedUrl = embedDeConsulta(ev.local);
    }
  }

  const local = {
    id:
      globalThis.crypto?.randomUUID?.() ||
      `map-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    label: rotulo,
    embedUrl: embedUrl || null,
    linkUrl: norm.linkUrl || null,
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
