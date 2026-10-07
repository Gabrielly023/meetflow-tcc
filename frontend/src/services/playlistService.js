import * as playlistApi from "./playlistApi";

// ======================================================
// SPOTIFY
// ======================================================

// Converte qualquer forma de link do Spotify para uma URL de embed.
//
// Aceita:
// - https://open.spotify.com/playlist/ID
// - https://open.spotify.com/embed/playlist/ID
// - spotify:playlist:ID
// - código <iframe ... src="...">
//
// Retorna a URL de embed ou null se for inválida.
export function normalizarParaEmbed(entrada) {
  if (!entrada) return null;

  let texto = String(entrada).trim();

  // Caso tenham colado o iframe inteiro
  const matchIframe = texto.match(/src=["']([^"']+)["']/i);

  if (matchIframe) {
    texto = matchIframe[1];
  }

  const tipos = "playlist|album|track|artist|show|episode";

  // URI do Spotify
  const matchUri = texto.match(
    new RegExp(`^spotify:(${tipos}):([A-Za-z0-9]+)`, "i")
  );

  if (matchUri) {
    return `https://open.spotify.com/embed/${matchUri[1].toLowerCase()}/${matchUri[2]}`;
  }

  // Link normal ou já em formato embed
  const matchUrl = texto.match(
    new RegExp(
      `open\\.spotify\\.com/(?:intl-[a-z-]+/)?(?:embed/)?(${tipos})/([A-Za-z0-9]+)`,
      "i"
    )
  );

  if (matchUrl) {
    return `https://open.spotify.com/embed/${matchUrl[1].toLowerCase()}/${matchUrl[2]}`;
  }

  return null;
}

// Converte embed -> link normal do Spotify
//
// Ex:
// https://open.spotify.com/embed/playlist/ID
// ->
// https://open.spotify.com/playlist/ID
export function embedParaSpotify(embed) {
  if (!embed) return null;

  return embed.replace("/embed/", "/");
}

// Converte embed -> URI do Spotify
//
// Ex:
// https://open.spotify.com/embed/playlist/ID
// ->
// spotify:playlist:ID
export function embedParaUri(embed) {
  if (!embed) return null;

  const match = String(embed).match(
    /open\.spotify\.com\/embed\/([a-z]+)\/([A-Za-z0-9]+)/i
  );

  return match
    ? `spotify:${match[1].toLowerCase()}:${match[2]}`
    : null;
}

// ======================================================
// PLAYLIST — BACKEND REAL
// ======================================================

// Lista os links Spotify cadastrados no evento.
//
// Retorna:
// [
//   "https://open.spotify.com/playlist/...",
//   "https://open.spotify.com/album/..."
// ]
export async function listarPlaylist(eventId) {
  return playlistApi.listarPlaylist(eventId);
}

// Adiciona um novo link Spotify.
//
// Retorna a playlist atualizada.
export async function adicionarPlaylist(eventId, entrada) {
  const link = embedParaSpotify(normalizarParaEmbed(entrada));

  if (!link) {
    return {
      erro: "invalido",
    };
  }

  try {
    const playlist = await playlistApi.adicionarPlaylist(eventId, link);

    return {
      sucesso: true,
      playlist,
    };
  } catch (erro) {
    console.error("Erro ao adicionar playlist:", erro);

    return {
      erro:
        erro?.response?.data?.mensagem ||
        "Não foi possível adicionar a playlist.",
    };
  }
}

// Atualiza um link existente.
//
// Recebe o link antigo e o novo link.
export async function atualizarPlaylist(
  eventId,
  linkAntigo,
  entradaNova
) {
  const linkNovo = embedParaSpotify(normalizarParaEmbed(entradaNova));

  if (!linkNovo) {
    return {
      erro: "invalido",
    };
  }

  try {
    const playlist = await playlistApi.atualizarPlaylist(
      eventId,
      linkAntigo,
      linkNovo
    );

    return {
      sucesso: true,
      playlist,
    };
  } catch (erro) {
    console.error("Erro ao atualizar playlist:", erro);

    return {
      erro:
        erro?.response?.data?.mensagem ||
        "Não foi possível atualizar a playlist.",
    };
  }
}

// Remove um link específico.
export async function removerPlaylist(eventId, linkSpotify) {
  try {
    const playlist = await playlistApi.removerPlaylist(
      eventId,
      linkSpotify
    );

    return {
      sucesso: true,
      playlist,
    };
  } catch (erro) {
    console.error("Erro ao remover playlist:", erro);

    return {
      erro:
        erro?.response?.data?.mensagem ||
        "Não foi possível remover a playlist.",
    };
  }
}

// ======================================================
// ÚLTIMA PLAYLIST OUVIDA
// ======================================================

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
    // Ignora se localStorage não estiver disponível
  }
}

// ======================================================
// CAPA DO SPOTIFY
// ======================================================

const KEY_CAPAS = "meetflow.playlistCapas";

// Busca a capa de um link Spotify usando o oEmbed do Spotify.
export async function getCapaPlaylist(linkSpotify) {
  if (!linkSpotify) return null;

  let cache = {};

  try {
    cache = JSON.parse(
      localStorage.getItem(KEY_CAPAS) || "{}"
    );
  } catch {
    cache = {};
  }

  if (cache[linkSpotify]) {
    return cache[linkSpotify];
  }

  try {
    const resp = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(
        linkSpotify
      )}`
    );

    if (!resp.ok) return null;

    const dados = await resp.json();
    const capa = dados?.thumbnail_url || null;

    if (capa) {
      cache[linkSpotify] = capa;

      try {
        localStorage.setItem(
          KEY_CAPAS,
          JSON.stringify(cache)
        );
      } catch {
        // Sem espaço no localStorage: segue normalmente
      }
    }

    return capa;
  } catch {
    return null;
  }
}