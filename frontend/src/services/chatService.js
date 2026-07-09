import { buscarEventoPorId, getUsuarioAtualId, isDono } from "./eventoService";
import { getUsuarioLogado } from "./usuarioService";
import { USE_API } from "./config";
import * as chatApi from "./chatApi";

// "Backend falso" do chat de cada evento (persistido em localStorage).
// Espelha as assinaturas de chatApi.js: quando USE_API.chat virar true, cada
// função passa a chamar o backend real, sem as telas mudarem.
//
// Formato de uma mensagem (o mesmo do adapters.mensagemDaApi):
//   {
//     id, eventId, ownerId, sender, tipo,           // tipo: mensagem|imagem|sistema
//     text, imageUrl, createdAt, editedAt,
//     replyTo: { id, sender, text } | null,         // responder/citar
//     reactions: { "👍": [userId], ... },           // reações por emoji
//     readBy: [userId],                             // confirmação de leitura
//     deleted: boolean,                             // mensagem apagada (lápide)
//   }

const KEY_MSGS = "meetflow.chat.mensagens"; // { [eventId]: [msg] }
const KEY_PARTS = "meetflow.chat.participantes"; // { [eventId]: [{id,name}] }
const KEY_SEED = "meetflow.chat.semeados"; // [eventId] já inicializados do mock

// ─────────────────────────── storage ───────────────────────────

function ler(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch (erro) {
    console.error("Erro ao ler o chat:", erro);
    return padrao;
  }
}

function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    console.error("Não foi possível salvar o chat:", erro);
    return false;
  }
}

function novoId(prefixo = "msg") {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${prefixo}-${Date.now()}-${Math.round(Math.random() * 1e6)}`
  );
}

// ─────────────────────────── identidade ───────────────────────────

// Id estável do usuário atual deste navegador (mesmo usado nos eventos).
export function meuId() {
  return getUsuarioAtualId();
}

// Nome de exibição do usuário logado (cai para "Você" se não houver).
export function meuNome() {
  return getUsuarioLogado()?.nome || "Você";
}

// Diz se o usuário atual é o organizador do evento (pode moderar o chat).
export function isOrganizador(eventId) {
  return isDono(buscarEventoPorId(eventId));
}

// Diz se a mensagem é do usuário atual.
export function isMinha(msg) {
  return Boolean(msg && msg.ownerId === getUsuarioAtualId());
}

// Pode apagar quem escreveu a mensagem OU o organizador do evento.
export function podeExcluir(eventId, msg) {
  if (!msg || msg.tipo === "sistema") return false;
  return isMinha(msg) || isOrganizador(eventId);
}

// ─────────────────────────── seed (mock) ───────────────────────────

// Inicializa participantes e mensagens do evento a partir do mock (só 1x).
function semear(eventId) {
  const semeados = ler(KEY_SEED, []);
  if (semeados.includes(String(eventId))) return;

  const evento = buscarEventoPorId(eventId);
  const uid = getUsuarioAtualId();

  // Participantes
  const parts = ler(KEY_PARTS, {});
  if (!parts[eventId]) {
    parts[eventId] = (evento?.participants || []).map((p) => ({
      id: `seed:${p.name}`,
      name: p.name,
    }));
    salvar(KEY_PARTS, parts);
  }
  const idsParticipantes = (parts[eventId] || []).map((p) => p.id);

  // Mensagens
  const msgs = ler(KEY_MSGS, {});
  if (!msgs[eventId]) {
    const base = evento?.messages || [];
    const agora = Date.now();
    msgs[eventId] = base.map((m, i) => {
      const souEu = m.sender === "Você";
      const ownerId = souEu ? uid : `seed:${m.sender}`;
      return {
        id: novoId("seed"),
        eventId: String(eventId),
        ownerId,
        sender: souEu ? "Você" : m.sender,
        tipo: "mensagem",
        text: m.text,
        imageUrl: null,
        // Distribui as mensagens antigas em ~3 min de intervalo, terminando
        // pouco antes de "agora".
        createdAt: agora - (base.length - i) * 3 * 60000,
        editedAt: null,
        replyTo: null,
        reactions: {},
        // Convenção do mock: mensagens antigas dos OUTROS começam "não lidas"
        // para mim (para o badge de não-lidas fazer sentido); as MINHAS já
        // constam como vistas pelos participantes.
        readBy: souEu ? [uid, ...idsParticipantes] : [ownerId],
        deleted: false,
      };
    });
    salvar(KEY_MSGS, msgs);
  }

  salvar(KEY_SEED, [...semeados, String(eventId)]);
}

function lerMsgs(eventId) {
  semear(eventId);
  return ler(KEY_MSGS, {})[eventId] || [];
}

function escreverMsgs(eventId, lista) {
  const todas = ler(KEY_MSGS, {});
  todas[eventId] = lista;
  salvar(KEY_MSGS, todas);
}

function ordenar(lista) {
  return [...lista].sort((a, b) => a.createdAt - b.createdAt);
}

// ─────────────────────────── mensagens ───────────────────────────

// Lista as mensagens do evento (ordenadas da mais antiga para a mais nova).
export function listarMensagens(eventId) {
  if (USE_API.chat) return chatApi.listarMensagens(eventId);
  return ordenar(lerMsgs(eventId));
}

// Envia uma mensagem. opts: { tipo, imageUrl, audioUrl, duracao, replyTo }.
export function enviarMensagem(eventId, texto, opts = {}) {
  if (USE_API.chat) return chatApi.enviarMensagem(eventId, texto, opts);
  const uid = getUsuarioAtualId();
  const conteudo = (texto || "").trim();
  const tipo = opts.tipo || "mensagem";
  if (!conteudo && !opts.imageUrl && !opts.audioUrl) return null;

  const msg = {
    id: novoId(),
    eventId: String(eventId),
    ownerId: uid,
    sender: "Você",
    tipo,
    text: conteudo,
    imageUrl: opts.imageUrl || null,
    audioUrl: opts.audioUrl || null,
    duracao: opts.duracao || null,
    createdAt: Date.now(),
    editedAt: null,
    replyTo: opts.replyTo || null,
    reactions: {},
    readBy: [uid],
    deleted: false,
  };

  escreverMsgs(eventId, [...lerMsgs(eventId), msg]);
  return msg;
}

// Registra uma mensagem de SISTEMA (ex.: "Fulano entrou no chat").
export function registrarSistema(eventId, texto) {
  const uid = getUsuarioAtualId();
  const msg = {
    id: novoId("sys"),
    eventId: String(eventId),
    ownerId: "sistema",
    sender: "sistema",
    tipo: "sistema",
    text: texto,
    imageUrl: null,
    createdAt: Date.now(),
    editedAt: null,
    replyTo: null,
    reactions: {},
    readBy: [uid],
    deleted: false,
  };
  escreverMsgs(eventId, [...lerMsgs(eventId), msg]);
  return msg;
}

// Edita uma mensagem própria (não vale para imagem/sistema/apagada).
export function editarMensagem(eventId, msgId, novoTexto) {
  if (USE_API.chat) return chatApi.editarMensagem(eventId, msgId, novoTexto);
  const uid = getUsuarioAtualId();
  const lista = lerMsgs(eventId);
  const alvo = lista.find((m) => m.id === msgId);
  if (!alvo || alvo.ownerId !== uid || alvo.deleted || alvo.tipo !== "mensagem") {
    return false;
  }
  const conteudo = (novoTexto || "").trim();
  if (!conteudo) return false;
  escreverMsgs(
    eventId,
    lista.map((m) =>
      m.id === msgId ? { ...m, text: conteudo, editedAt: Date.now() } : m,
    ),
  );
  return true;
}

// Apaga uma mensagem (vira lápide "mensagem apagada"). Dono ou organizador.
export function excluirMensagem(eventId, msgId) {
  if (USE_API.chat) return chatApi.excluirMensagem(eventId, msgId);
  const lista = lerMsgs(eventId);
  const alvo = lista.find((m) => m.id === msgId);
  if (!alvo || !podeExcluir(eventId, alvo)) return false;
  escreverMsgs(
    eventId,
    lista.map((m) =>
      m.id === msgId
        ? {
            ...m,
            deleted: true,
            text: "",
            imageUrl: null,
            audioUrl: null,
            reactions: {},
            replyTo: null,
          }
        : m,
    ),
  );
  return true;
}

// Alterna a reação (emoji) do usuário atual em uma mensagem.
export function alternarReacao(eventId, msgId, emoji) {
  if (USE_API.chat) return chatApi.alternarReacao(eventId, msgId, emoji);
  const uid = getUsuarioAtualId();
  const lista = lerMsgs(eventId);
  escreverMsgs(
    eventId,
    lista.map((m) => {
      if (m.id !== msgId) return m;
      const atual = m.reactions?.[emoji] || [];
      const novos = atual.includes(uid)
        ? atual.filter((x) => x !== uid)
        : [...atual, uid];
      const reactions = { ...(m.reactions || {}) };
      if (novos.length) reactions[emoji] = novos;
      else delete reactions[emoji];
      return { ...m, reactions };
    }),
  );
  return true;
}

// Marca todas as mensagens do evento como lidas pelo usuário atual.
export function marcarComoLidas(eventId) {
  if (USE_API.chat) return chatApi.marcarComoLidas(eventId);
  const uid = getUsuarioAtualId();
  const lista = lerMsgs(eventId);
  let mudou = false;
  const nova = lista.map((m) => {
    if ((m.readBy || []).includes(uid)) return m;
    mudou = true;
    return { ...m, readBy: [...(m.readBy || []), uid] };
  });
  if (mudou) escreverMsgs(eventId, nova);
  return true;
}

// Quantas mensagens estão não lidas para o usuário atual (dos outros).
export function contarNaoLidas(eventId) {
  const uid = getUsuarioAtualId();
  return lerMsgs(eventId).filter(
    (m) =>
      !m.deleted &&
      m.tipo !== "sistema" &&
      m.ownerId !== uid &&
      !(m.readBy || []).includes(uid),
  ).length;
}

// A última mensagem do evento (para a prévia e a página "Meus Chat's").
export function ultimaMensagem(eventId) {
  const lista = ordenar(lerMsgs(eventId)).filter((m) => m.tipo !== "sistema" || true);
  return lista[lista.length - 1] || null;
}

// Quantas pessoas (além de mim) já leram a mensagem — para o "Visto".
export function lidaPorOutros(msg) {
  const uid = getUsuarioAtualId();
  return (msg?.readBy || []).filter((x) => x !== uid && x !== msg.ownerId).length;
}

// ─────────────────────────── participantes ───────────────────────────

export function listarParticipantes(eventId) {
  semear(eventId);
  return ler(KEY_PARTS, {})[eventId] || [];
}

// Só admins do grupo podem adicionar participantes.
export function adicionarParticipante(eventId, nome) {
  if (!souAdminGrupo(eventId)) return { erro: "semPermissao" };
  const limpo = (nome || "").trim();
  if (!limpo) return { erro: "vazio" };
  const todas = ler(KEY_PARTS, {});
  const lista = todas[eventId] || [];
  if (lista.some((p) => p.name.toLowerCase() === limpo.toLowerCase())) {
    return { erro: "duplicado" };
  }
  const participante = { id: novoId("part"), name: limpo };
  todas[eventId] = [...lista, participante];
  salvar(KEY_PARTS, todas);
  registrarSistema(eventId, `${limpo} entrou no grupo.`);
  return { participante };
}

// Só admins do grupo podem remover participantes.
export function removerParticipante(eventId, pid) {
  if (!souAdminGrupo(eventId)) return false;
  const todas = ler(KEY_PARTS, {});
  const lista = todas[eventId] || [];
  const alvo = lista.find((p) => p.id === pid);
  if (!alvo) return false;
  todas[eventId] = lista.filter((p) => p.id !== pid);
  salvar(KEY_PARTS, todas);
  // Ao sair, deixa de ser admin também.
  rebaixarAdminInterno(eventId, pid);
  registrarSistema(eventId, `${alvo.name} saiu do grupo.`);
  return true;
}

// ─────────────────────────── grupo (config) ───────────────────────────
// WhatsApp-like: cada evento tem um "grupo" com nome próprio (pode diferir do
// nome do evento), descrição, foto, papel de parede e uma lista de admins.
// O CRIADOR do evento é sempre admin e é o único que nomeia/remove admins;
// qualquer admin adiciona/remove participantes.

const KEY_GRUPO = "meetflow.chat.grupo"; // { [eventId]: { nome, descricao, foto, papelDeParede, adminIds } }

function lerGrupo(eventId) {
  return ler(KEY_GRUPO, {})[eventId] || {};
}

function salvarGrupo(eventId, patch) {
  const todos = ler(KEY_GRUPO, {});
  todos[eventId] = { ...(todos[eventId] || {}), ...patch };
  salvar(KEY_GRUPO, todos);
  return todos[eventId];
}

// Nome do grupo (cai para o `fallback` — normalmente o título do evento).
export function getNomeGrupo(eventId, fallback = "") {
  return lerGrupo(eventId).nome || fallback;
}
export function setNomeGrupo(eventId, nome) {
  if (!souAdminGrupo(eventId)) return false;
  salvarGrupo(eventId, { nome: (nome || "").trim() });
  return true;
}

export function getDescricaoGrupo(eventId) {
  return lerGrupo(eventId).descricao || "";
}
export function setDescricaoGrupo(eventId, descricao) {
  if (!souAdminGrupo(eventId)) return false;
  salvarGrupo(eventId, { descricao: (descricao || "").trim() });
  return true;
}

export function getFotoGrupo(eventId) {
  return lerGrupo(eventId).foto || null;
}
export function setFotoGrupo(eventId, foto) {
  if (!souAdminGrupo(eventId)) return false;
  salvarGrupo(eventId, { foto: foto || null });
  return true;
}

// Papel de parede do chat (id de predefinição ou data URL). Cosmético: sem gate.
export function getPapelDeParede(eventId) {
  return lerGrupo(eventId).papelDeParede || "padrao";
}
export function setPapelDeParede(eventId, valor) {
  salvarGrupo(eventId, { papelDeParede: valor || "padrao" });
  return true;
}

// ─────────────────────────── grupo (admins) ───────────────────────────

export function listarAdminIds(eventId) {
  return lerGrupo(eventId).adminIds || [];
}

export function isParticipanteAdmin(eventId, pid) {
  return listarAdminIds(eventId).includes(pid);
}

// O usuário atual é admin do grupo? (criador do evento OU nomeado admin).
export function souAdminGrupo(eventId) {
  return isOrganizador(eventId) || listarAdminIds(eventId).includes(getUsuarioAtualId());
}

// Só o criador do evento nomeia/remove admins.
export function promoverAdmin(eventId, pid) {
  if (!isOrganizador(eventId)) return false;
  const ids = listarAdminIds(eventId);
  if (!ids.includes(pid)) salvarGrupo(eventId, { adminIds: [...ids, pid] });
  return true;
}
export function rebaixarAdmin(eventId, pid) {
  if (!isOrganizador(eventId)) return false;
  rebaixarAdminInterno(eventId, pid);
  return true;
}
function rebaixarAdminInterno(eventId, pid) {
  const ids = listarAdminIds(eventId);
  if (ids.includes(pid)) {
    salvarGrupo(eventId, { adminIds: ids.filter((x) => x !== pid) });
  }
}

// ─────────────────────────── imagem (mock) ───────────────────────────

// Reduz a imagem escolhida e devolve uma data URL (evita estourar o
// localStorage). No backend real, o upload devolveria uma URL de verdade.
export function arquivoParaDataUrl(arquivo, maxLado = 1000) {
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

// ─────────────────────────── formatação (datas/avatar) ───────────────────────────

// "20:34" — hora da mensagem.
export function formatarHora(ts) {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "agora", "há 5 min", "há 2 h", "ontem"... — tempo relativo curto.
export function tempoRelativo(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  return new Date(ts).toLocaleDateString("pt-BR");
}

// "Hoje" / "Ontem" / "3 de julho de 2026" — rótulo do separador por dia.
export function rotuloDia(ts) {
  const d = new Date(ts);
  const hoje = new Date();
  const mesmoDia = (a, b) => a.toDateString() === b.toDateString();
  if (mesmoDia(d, hoje)) return "Hoje";
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  if (mesmoDia(d, ontem)) return "Ontem";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Iniciais para o avatar (ex.: "Ana Paula" -> "AP").
export function iniciais(nome) {
  const partes = (nome || "?").trim().split(/\s+/);
  const ini = (partes[0]?.[0] || "") + (partes[1]?.[0] || "");
  return ini.toUpperCase() || "?";
}

// Cor estável do avatar a partir do nome (mesma cor sempre para a mesma pessoa).
const CORES_AVATAR = [
  "from-orange-500 to-fuchsia-500",
  "from-fuchsia-500 to-violet-500",
  "from-violet-500 to-sky-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-sky-500",
  "from-rose-500 to-orange-500",
];

export function corDoNome(nome) {
  let h = 0;
  for (const c of nome || "?") h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return CORES_AVATAR[h % CORES_AVATAR.length];
}

// ─────────────────────────── papel de parede ───────────────────────────
// Predefinições compartilhadas pelo grupo. O valor guardado em getPapelDeParede
// é o `id` de uma predefinição OU uma data URL (imagem própria já ajustada).

export const WALLPAPERS = [
  { id: "padrao", label: "Padrão", base: "#020617" },
  { id: "aurora", label: "Aurora", css: "linear-gradient(160deg,#1e1b4b,#0f172a 55%,#4a044e)" },
  { id: "oceano", label: "Oceano", css: "linear-gradient(160deg,#0c4a6e,#0f172a 55%,#164e63)" },
  { id: "brasa", label: "Brasa", css: "linear-gradient(160deg,#7c2d12,#0f172a 55%,#831843)" },
  { id: "floresta", label: "Floresta", css: "linear-gradient(160deg,#14532d,#0f172a 55%,#134e4a)" },
  {
    id: "bolhas",
    label: "Bolhas",
    base: "#0b1120",
    css: "radial-gradient(circle at 20% 25%, rgba(217,70,239,.15), transparent 40%), radial-gradient(circle at 80% 75%, rgba(56,189,248,.15), transparent 42%)",
  },
];

// Converte o valor guardado (id de predefinição ou data URL) em estilo CSS.
export function estiloPapelDeParede(valor) {
  if (!valor || valor === "padrao") return {};
  if (valor.startsWith("data:")) {
    return {
      backgroundImage: `url(${valor})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  const w = WALLPAPERS.find((x) => x.id === valor);
  if (!w) return {};
  return { backgroundColor: w.base || "transparent", backgroundImage: w.css };
}
