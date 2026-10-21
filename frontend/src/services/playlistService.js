
import * as playlistApi from "./playlistApi";

// Converte links do Spotify para o formato usado no iframe.
export function normalizarParaEmbed(entrada) {
  if (!entrada) return null;

  let texto = String(entrada).trim();

  const matchIframe = texto.match(/src=["']([^"']+)["']/i);
  if (matchIframe) texto = matchIframe[1];

  const tipos = "playlist|album|track|artist|show|episode";

  const matchUri = texto.match(
    new RegExp(`^spotify:(${tipos}):([A-Za-z0-9]+)`, "i"),
  );

  if (matchUri) {
    return `https://open.spotify.com/embed/${matchUri[1].toLowerCase()}/${matchUri[2]}`;
  }

  const matchUrl = texto.match(
    new RegExp(
      `open\\.spotify\\.com/(?:intl-[a-z-]+/)?(?:embed/)?(${tipos})/([A-Za-z0-9]+)`,
      "i",
    ),
  );

  if (matchUrl) {
    return `https://open.spotify.com/embed/${matchUrl[1].toLowerCase()}/${matchUrl[2]}`;
  }

  return null;
}

export function embedParaSpotify(embed) {
  if (!embed) return null;
  return embed.replace("/embed/", "/");
}

export function embedParaUri(embed) {
  if (!embed) return null;

  const match = String(embed).match(
    /open\.spotify\.com\/embed\/([a-z]+)\/([A-Za-z0-9]+)/i,
  );

  return match
    ? `spotify:${match[1].toLowerCase()}:${match[2]}`
    : null;
}

// Busca os links salvos no backend e retorna o embed do primeiro.
export async function carregarPlaylist(eventId) {
  const links = await playlistApi.listarPlaylist(eventId);
  return normalizarParaEmbed(links[0] || "");
}

// Salva ou troca o primeiro link, preservando os demais se existirem.
export async function definirPlaylist(eventId, entrada) {
  const embed = normalizarParaEmbed(entrada);
  if (!embed) return null;

  const linkNovo = embedParaSpotify(embed);
  const links = await playlistApi.listarPlaylist(eventId);

  if (links.includes(linkNovo)) return embed;

  if (links.length > 0) {
    await playlistApi.atualizarPlaylist(eventId, links[0], linkNovo);
  } else {
    await playlistApi.adicionarPlaylist(eventId, linkNovo);
  }

  return embed;
}

// Remove apenas o primeiro link salvo no backend.
export async function removerPlaylist(eventId) {
  const links = await playlistApi.listarPlaylist(eventId);

  if (links.length > 0) {
    await playlistApi.removerPlaylist(eventId, links[0]);
  }

  return normalizarParaEmbed(links[1] || "");
}

// Mantido para páginas antigas que ainda consultem a playlist de forma síncrona.
// A página do evento deve usar carregarPlaylist para buscar o dado real.
export function getPlaylistEmbed() {
  return null;
}

export function getSpotifyUrl(embed) {
  return embedParaSpotify(embed);
}

const KEY_ULTIMA = "meetflow.ultimaPlaylist";

export function getUltimaPlaylist() {
  try {
    return localStorage.getItem(KEY_ULTIMA) || null;
  } catch {
    return null;
  }
}

export function setUltimaPlaylist(eventId) {
  try {
    localStorage.setItem(KEY_ULTIMA, String(eventId));
  } catch {
    // Ignora quando o localStorage não estiver disponível.
  }
}

const KEY_CAPAS = "meetflow.playlistCapas";

export async function getCapaPlaylist(eventId, embedSalvo = null) {
  const embed = embedSalvo || await carregarPlaylist(eventId);
  if (!embed) return null;

  let cache = {};

  try {
    cache = JSON.parse(localStorage.getItem(KEY_CAPAS) || "{}");
  } catch {
    // Se o cache estiver inválido, busca a capa novamente.
  }

  if (cache[embed]) return cache[embed];

  try {
    const url = embedParaSpotify(embed);
    const resposta = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
    );

    if (!resposta.ok) return null;

    const dados = await resposta.json();
    const capa = dados?.thumbnail_url || null;

    if (capa) {
      cache[embed] = capa;
      localStorage.setItem(KEY_CAPAS, JSON.stringify(cache));
    }

    return capa;
  } catch {
    return null;
  }
}
