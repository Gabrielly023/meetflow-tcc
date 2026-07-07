import { buscarEventoPorId, getUsuarioAtualId } from "./eventoService";

// "Backend falso" da playlist de cada evento (persistido em localStorage).
// Cada evento tem sua própria playlist e elas não se misturam (igual à galeria).
// Guardamos só a URL de embed do Spotify, no formato { [eventId]: embedUrl }.
// Quando o backend real existir, basta trocar o corpo destas funções por Axios.

const KEY = "meetflow.playlists";
const KEY_MUSICAS = "meetflow.musicas"; // { [eventId]: [ {id, embed, url, ownerId} ] }

function ler() {
  try {
    const bruto = localStorage.getItem(KEY);
    return bruto ? JSON.parse(bruto) : {};
  } catch (erro) {
    console.error("Erro ao ler playlists:", erro);
    return {};
  }
}

function salvar(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar a playlist:", erro);
    return false;
  }
}

// Converte qualquer forma de link do Spotify em uma URL de embed.
// Aceita: link normal ("open.spotify.com/playlist/ID?si=..."),
//         URI ("spotify:playlist:ID") e até o código <iframe ... src="...">.
// Retorna a URL de embed ou null se não for um link válido do Spotify.
export function normalizarParaEmbed(entrada) {
  if (!entrada) return null;
  let texto = String(entrada).trim();

  // Se colaram o código completo <iframe ... src="URL">, extrai o src
  const matchIframe = texto.match(/src=["']([^"']+)["']/i);
  if (matchIframe) texto = matchIframe[1];

  const tipos = "playlist|album|track|artist|show|episode";

  // URI do app: spotify:playlist:ID
  const matchUri = texto.match(
    new RegExp(`^spotify:(${tipos}):([A-Za-z0-9]+)`, "i"),
  );
  if (matchUri) {
    return `https://open.spotify.com/embed/${matchUri[1].toLowerCase()}/${matchUri[2]}`;
  }

  // Link normal ou já em formato de embed.
  // Aceita o prefixo de idioma que o Spotify adiciona (ex.: "/intl-pt/").
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

// Converte a URL de embed de volta na URL normal do Spotify (para abrir no app/site).
// Ex.: open.spotify.com/embed/album/ID -> open.spotify.com/album/ID
export function embedParaSpotify(embed) {
  if (!embed) return null;
  return embed.replace("/embed/", "/");
}

// URL do Spotify da playlist do evento (para abrir no app), ou null se não houver.
export function getSpotifyUrl(eventId) {
  return embedParaSpotify(getPlaylistEmbed(eventId));
}

// Embed atual do evento: primeiro o que o usuário salvou; senão o padrão do evento (seed).
export function getPlaylistEmbed(eventId) {
  const salvos = ler();
  if (salvos[eventId]) return salvos[eventId];
  const evento = buscarEventoPorId(eventId);
  return evento?.playlist?.embedUrl || null;
}

// Define/atualiza a playlist do evento a partir de um link colado pelo usuário.
// Retorna a URL de embed salva, ou null se o link for inválido.
export function definirPlaylist(eventId, entrada) {
  const embed = normalizarParaEmbed(entrada);
  if (!embed) return null;

  const salvos = ler();
  salvos[eventId] = embed;
  salvar(salvos);
  return embed;
}

// Remove a playlist adicionada pelo usuário (volta ao padrão do evento, se houver).
export function removerPlaylist(eventId) {
  const salvos = ler();
  if (salvos[eventId]) {
    delete salvos[eventId];
    salvar(salvos);
  }
}

// Guarda qual foi a última playlist que o usuário ouviu (por evento),
// para destacá-la no topo da página geral de playlists.
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
    // sem localStorage disponível: apenas ignora
  }
}

// Capa (thumbnail) da playlist do evento no Spotify, via oEmbed público.
// Guarda o resultado em cache no localStorage para não consultar o Spotify toda vez.
// Retorna a URL da imagem, ou null se o evento não tiver playlist / falhar.
const KEY_CAPAS = "meetflow.playlistCapas"; // { [embedUrl]: thumbnailUrl }

export async function getCapaPlaylist(eventId) {
  const embed = getPlaylistEmbed(eventId);
  if (!embed) return null;

  let cache = {};
  try {
    cache = JSON.parse(localStorage.getItem(KEY_CAPAS) || "{}");
  } catch {
    // cache corrompido: ignora e segue com objeto vazio
  }
  if (cache[embed]) return cache[embed];

  try {
    const url = embedParaSpotify(embed);
    const resp = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (!resp.ok) return null;
    const dados = await resp.json();
    const capa = dados?.thumbnail_url || null;
    if (capa) {
      cache[embed] = capa;
      try {
        localStorage.setItem(KEY_CAPAS, JSON.stringify(cache));
      } catch {
        // sem espaço no localStorage: segue sem cache, sem quebrar
      }
    }
    return capa;
  } catch {
    return null;
  }
}

//
// LISTA DE MÚSICAS COLABORATIVA (por evento)
// Cada participante pode adicionar músicas colando o link do Spotify.
// (Espelha a tabela "Musica" do banco: link_spotify + quem adicionou.)
//

function lerMusicas() {
  try {
    const bruto = localStorage.getItem(KEY_MUSICAS);
    return bruto ? JSON.parse(bruto) : {};
  } catch (erro) {
    console.error("Erro ao ler músicas:", erro);
    return {};
  }
}

function salvarMusicas(obj) {
  try {
    localStorage.setItem(KEY_MUSICAS, JSON.stringify(obj));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar as músicas:", erro);
    return false;
  }
}

// Diz se a música foi adicionada pelo usuário atual (só ele pode removê-la).
export function isDonoMusica(musica) {
  return Boolean(musica && musica.ownerId === getUsuarioAtualId());
}

// Garante que a música tenha o campo de votos (compatível com dados antigos).
function comVotos(musica) {
  return { ...musica, votos: Array.isArray(musica.votos) ? musica.votos : [] };
}

// Lista as músicas do evento, das mais votadas para as menos votadas.
// Empate mantém a ordem em que foram adicionadas (sort estável do JS).
export function listarMusicas(eventId) {
  const lista = (lerMusicas()[eventId] || []).map(comVotos);
  return [...lista].sort((a, b) => b.votos.length - a.votos.length);
}

// Diz se o usuário atual já votou nessa música.
export function usuarioVotou(musica) {
  return Boolean(musica?.votos?.includes(getUsuarioAtualId()));
}

// Adiciona uma música à lista do evento a partir de um link do Spotify.
// Retorna { musica } em caso de sucesso, ou { erro: "invalido" | "duplicada" }.
export function adicionarMusica(eventId, entrada) {
  const embed = normalizarParaEmbed(entrada);
  if (!embed) return { erro: "invalido" };

  const todas = lerMusicas();
  const lista = todas[eventId] || [];

  // Evita adicionar a mesma música duas vezes
  if (lista.some((m) => m.embed === embed)) {
    return { erro: "duplicada" };
  }

  const musica = {
    id:
      globalThis.crypto?.randomUUID?.() ||
      `mus-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    embed,
    url: embedParaSpotify(embed),
    ownerId: getUsuarioAtualId(),
    votos: [],
  };

  todas[eventId] = [...lista, musica];
  salvarMusicas(todas);
  return { musica };
}

// Alterna o voto do usuário atual em uma música (curtir / descurtir).
export function curtirMusica(eventId, musicaId) {
  const uid = getUsuarioAtualId();
  const todas = lerMusicas();
  const lista = todas[eventId] || [];
  const idx = lista.findIndex((m) => m.id === musicaId);
  if (idx === -1) return;

  const votos = Array.isArray(lista[idx].votos) ? lista[idx].votos : [];
  lista[idx] = {
    ...lista[idx],
    votos: votos.includes(uid)
      ? votos.filter((v) => v !== uid)
      : [...votos, uid],
  };

  todas[eventId] = lista;
  salvarMusicas(todas);
}

// Remove uma música da lista (só o dono da música pode).
export function removerMusica(eventId, musicaId) {
  const todas = lerMusicas();
  const lista = todas[eventId] || [];
  const alvo = lista.find((m) => m.id === musicaId);
  if (!alvo || !isDonoMusica(alvo)) return false;

  todas[eventId] = lista.filter((m) => m.id !== musicaId);
  salvarMusicas(todas);
  return true;
}
