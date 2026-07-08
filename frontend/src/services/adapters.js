// Tradutores entre o formato do BACKEND (colunas do banco / Prisma) e o
// formato que as telas do frontend já esperam. Ficam aqui, isolados, para
// que as páginas e componentes NÃO precisem mudar quando ligarmos a API real.
//
// Convenção de nome:
//   xxxDaApi   -> converte o JSON que veio do backend  -> formato do front
//   xxxParaApi -> converte os dados do formulário front -> JSON pro backend

import { formatarDataHora } from "./eventoService";
import { normalizarParaEmbed } from "./playlistService";

// ───────────────────────── EVENTO ─────────────────────────

// "2026-07-12T20:00:00.000Z" (ISO do backend) -> "2026-07-12T20:00"
// (formato do <input type="datetime-local"> usado no formulário).
function isoParaInput(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 16);
}

export function eventoDaApi(e) {
  if (!e) return null;
  const dataHora = isoParaInput(e.data_hora);
  return {
    id: e.id_evento,
    ownerId: e.id_usuario,
    titulo: e.titulo,
    descricao: e.descricao || "",
    dataHora,
    data: formatarDataHora(dataHora),
    local: e.localizacao || "",
    senhaAcesso: e.senha_acesso || "",
    // Campos que dependem de colunas novas no schema (ver CONTRATO_API_FRONTEND.md):
    tipo: e.tipo || "",
    capa: e.capa_url || "",
    // Estas listas vêm de rotas separadas do evento:
    images: [], // GET /eventos/:id/galeria
    participants: [], // GET /eventos/:id/participantes
    messages: [], // GET /eventos/:id/chat
    playlist: {
      name: e.titulo,
      description: e.descricao || "Playlist do evento.",
    },
  };
}

export function eventoParaApi(dados) {
  return {
    titulo: dados.titulo,
    descricao: dados.descricao || "",
    data_hora: dados.dataHora ? new Date(dados.dataHora).toISOString() : null,
    localizacao: dados.local || "",
    senha_acesso: dados.senhaAcesso || "",
    // enviados só se o backend adicionar as colunas (ver contrato):
    tipo: dados.tipo || "",
    capa_url: dados.capa || "",
  };
}

// ───────────────────────── PARTICIPANTE ─────────────────────────

export function participanteDaApi(p) {
  return { id: p.id_usuario, name: p.nome };
}

// ───────────────────────── MÚSICA ─────────────────────────

export function musicaDaApi(m) {
  return {
    id: m.id_musica,
    embed: normalizarParaEmbed(m.link_spotify),
    url: m.link_spotify,
    ownerId: m.id_usuario,
    votos: Array.isArray(m.votos) ? m.votos : [],
  };
}

// ───────────────────────── FOTO (GALERIA) ─────────────────────────

export function fotoDaApi(f) {
  return {
    id: f.id_foto,
    url: f.url_foto,
    ownerId: f.id_usuario,
  };
}

// ───────────────────────── CHAT ─────────────────────────

export function mensagemDaApi(c, usuarioAtualId) {
  return {
    id: c.id_chat,
    sender:
      c.autor_nome || (c.id_usuario === usuarioAtualId ? "Você" : "Participante"),
    text: c.conteudo,
  };
}
