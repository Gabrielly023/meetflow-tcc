import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { buscarEventoPorId } from "../../services/eventoService";
import { getUsuarioLogado } from "../../services/usuarioService";
import {
  listarMensagens,
  enviarMensagem,
  editarMensagem,
  excluirMensagem,
  alternarReacao,
  marcarComoLidas,
  listarParticipantes,
  arquivoParaDataUrl,
  podeExcluir,
  lidaPorOutros,
  meuId,
  getNomeGrupo,
  getFotoGrupo,
  getPapelDeParede,
  setPapelDeParede,
  WALLPAPERS,
  estiloPapelDeParede,
  formatarHora,
  rotuloDia,
  iniciais,
  corDoNome,
} from "../../services/chatService";
import TituloDegrade from "../../components/TituloDegrade";
import ModalConfirmacao from "../../components/ModalConfirmacao";
import ImageAdjuster from "../../components/ImageAdjuster";

const MAX_MSG = 1000;
const EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "😮", "😢", "👏"];

// ─────────────────────────── ícones ───────────────────────────
const Icon = ({ d, className = "h-5 w-5", fill = "none" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={fill}
    viewBox="0 0 24 24"
    strokeWidth="1.7"
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const D = {
  busca: "M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z",
  imagem:
    "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z",
  enviar: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5",
  responder: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3",
  emoji:
    "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
  editar:
    "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z",
  lixo: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
  fechar: "M6 18L18 6M6 6l12 12",
  papel:
    "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z",
  chevron: "M8.25 4.5l7.5 7.5-7.5 7.5",
  microfone:
    "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
};

// "0:05" / "1:23"
function formataSegundos(s) {
  const min = Math.floor(s / 60);
  return `${min}:${String(s % 60).padStart(2, "0")}`;
}

// Avatar circular: foto (se houver) ou iniciais coloridas.
function Avatar({ nome, foto, size = "h-9 w-9" }) {
  if (foto) {
    return (
      <img src={foto} alt={nome} className={`${size} shrink-0 rounded-full object-cover`} />
    );
  }
  return (
    <div
      className={`${size} shrink-0 rounded-full bg-gradient-to-br ${corDoNome(
        nome,
      )} flex items-center justify-center text-xs font-bold text-white`}
    >
      {iniciais(nome)}
    </div>
  );
}

export default function ChatEvento() {
  const { id } = useParams();
  const evento = buscarEventoPorId(id);
  const usuario = getUsuarioLogado();
  const uid = meuId();

  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [firstUnreadId, setFirstUnreadId] = useState(null);

  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editing, setEditing] = useState(null); // { id, text }
  const [reactOpenId, setReactOpenId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [showWall, setShowWall] = useState(false);
  const [papel, setPapel] = useState("padrao");
  const [papelPendente, setPapelPendente] = useState(null); // aguardando confirmação (compartilhado)
  const [ajustarSrc, setAjustarSrc] = useState(null); // imagem em ajuste (ImageAdjuster)
  const [imagemAmpliada, setImagemAmpliada] = useState(null);

  const [gravando, setGravando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [erroGrav, setErroGrav] = useState("");

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const wallFileRef = useRef(null);
  const prevCount = useRef(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const inicioRef = useRef(0);
  const enviarAoPararRef = useRef(true);

  function recarregar() {
    Promise.resolve(listarMensagens(id)).then((msgs) => setMessages(msgs || []));
    setParticipants(listarParticipantes(id));
  }

  // Carrega tudo, calcula a primeira não lida (antes de marcar) e marca lidas.
  useEffect(() => {
    if (!evento) return;
    Promise.resolve(listarMensagens(id)).then((msgs) => {
      const lista = msgs || [];
      const primeira = lista.find(
        (m) =>
          m.tipo !== "sistema" &&
          m.ownerId !== uid &&
          !(m.readBy || []).includes(uid),
      );
      setFirstUnreadId(primeira?.id || null);
      setMessages(lista);
      setParticipants(listarParticipantes(id));
      setPapel(getPapelDeParede(id));
      marcarComoLidas(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-scroll para a última mensagem quando chega mensagem nova.
  useEffect(() => {
    if (messages.length > prevCount.current) {
      bottomRef.current?.scrollIntoView({
        behavior: prevCount.current === 0 ? "auto" : "smooth",
      });
    }
    prevCount.current = messages.length;
  }, [messages.length]);

  // Fecha a imagem ampliada com Esc.
  useEffect(() => {
    if (!imagemAmpliada) return;
    const aoTeclar = (e) => e.key === "Escape" && setImagemAmpliada(null);
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [imagemAmpliada]);

  // Ao sair da página, para a gravação e libera o microfone.
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") {
        enviarAoPararRef.current = false;
        rec.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (!evento) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-red-500/40 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-semibold">Evento não encontrado</h1>
          <p className="mt-4 text-slate-300">
            Verifique se o link está correto ou volte para a página de eventos.
          </p>
          <Link
            to="/eventos"
            className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Voltar para eventos
          </Link>
        </div>
      </main>
    );
  }

  const nomeGrupo = getNomeGrupo(id, evento.titulo);
  const fotoGrupo = getFotoGrupo(id);

  // ─────────────────────────── ações ───────────────────────────

  function handleSend() {
    const texto = newMessage.trim();
    if (!texto) return;
    enviarMensagem(id, texto, {
      replyTo: replyingTo
        ? { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text }
        : null,
    });
    setNewMessage("");
    setReplyingTo(null);
    recarregar();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleImage(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo || !arquivo.type.startsWith("image/")) return;
    try {
      const imageUrl = await arquivoParaDataUrl(arquivo);
      enviarMensagem(id, "", {
        tipo: "imagem",
        imageUrl,
        replyTo: replyingTo
          ? { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text }
          : null,
      });
      setReplyingTo(null);
      recarregar();
    } catch (erro) {
      console.error(erro);
    }
  }

  // Papel de parede vindo dos arquivos: lê a imagem e abre o ajustador (o
  // mesmo do resto do site). O recorte só é aplicado após a confirmação.
  function handleWallpaperFile(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo || !arquivo.type.startsWith("image/")) return;
    const leitor = new FileReader();
    leitor.onload = () => setAjustarSrc(leitor.result);
    leitor.readAsDataURL(arquivo);
  }

  // Toda escolha de papel de parede passa por um aviso (é compartilhado).
  function pedirPapel(valor) {
    setPapelPendente(valor);
  }

  // Aplica de fato o papel de parede escolhido (após confirmar o aviso).
  function escolherPapel(valor) {
    setPapelDeParede(id, valor);
    setPapel(valor);
  }

  function salvarEdicao() {
    if (!editing) return;
    editarMensagem(id, editing.id, editing.text);
    setEditing(null);
    recarregar();
  }

  function confirmarExclusao() {
    if (toDelete) {
      excluirMensagem(id, toDelete.id);
      recarregar();
    }
    setToDelete(null);
  }

  function reagir(msgId, emoji) {
    alternarReacao(id, msgId, emoji);
    setReactOpenId(null);
    recarregar();
  }

  // ─────────────────────────── gravação de áudio ───────────────────────────

  async function iniciarGravacao() {
    setErroGrav("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErroGrav("Seu navegador não permite gravar áudio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      enviarAoPararRef.current = true;
      const rec = new MediaRecorder(stream, { audioBitsPerSecond: 32000 });
      mediaRecorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = finalizarGravacao;
      rec.start();
      inicioRef.current = Date.now();
      setSegundos(0);
      setGravando(true);
      timerRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - inicioRef.current) / 1000);
        setSegundos(s);
        if (s >= 120) pararEEnviar(); // limite de 2 minutos
      }, 250);
    } catch (err) {
      console.error(err);
      setErroGrav("Não foi possível acessar o microfone. Verifique a permissão.");
      setGravando(false);
    }
  }

  function encerrarRecorder() {
    clearInterval(timerRef.current);
    setGravando(false);
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }

  function pararEEnviar() {
    enviarAoPararRef.current = true;
    encerrarRecorder();
  }

  function cancelarGravacao() {
    enviarAoPararRef.current = false;
    encerrarRecorder();
  }

  // Chamada quando o MediaRecorder para: monta o áudio e (se não foi cancelado)
  // envia como uma mensagem do tipo "audio".
  function finalizarGravacao() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const partes = chunksRef.current;
    chunksRef.current = [];
    if (!enviarAoPararRef.current || !partes.length) return;

    const dur = Math.max(1, Math.round((Date.now() - inicioRef.current) / 1000));
    const blob = new Blob(partes, {
      type: mediaRecorderRef.current?.mimeType || "audio/webm",
    });
    const leitor = new FileReader();
    leitor.onload = () => {
      enviarMensagem(id, "", {
        tipo: "audio",
        audioUrl: leitor.result,
        duracao: dur,
        replyTo: replyingTo
          ? { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text }
          : null,
      });
      setReplyingTo(null);
      recarregar();
    };
    leitor.readAsDataURL(blob);
  }

  // ─────────────────────────── render de uma mensagem ───────────────────────────

  function renderMensagem(m) {
    if (m.tipo === "sistema") {
      return (
        <div key={m.id} className="flex justify-center">
          <span className="rounded-full bg-slate-800/80 px-4 py-1 text-xs text-slate-300 backdrop-blur">
            {m.text}
          </span>
        </div>
      );
    }

    const isMe = m.ownerId === uid;
    const editandoEsta = editing?.id === m.id;
    const reacoes = Object.entries(m.reactions || {}).filter(([, u]) => u.length);
    const outrosLeram = lidaPorOutros(m);

    return (
      <div
        key={m.id}
        className={`group flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
      >
        {!isMe && <Avatar nome={m.sender} size="h-8 w-8" />}

        <div className={`flex max-w-[78%] flex-col ${isMe ? "items-end" : "items-start"}`}>
          <div
            className={`relative rounded-3xl px-4 py-3 shadow-lg ${
              isMe
                ? "bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 text-white shadow-fuchsia-500/20"
                : "bg-slate-950/85 text-slate-200 shadow-black/20 backdrop-blur"
            }`}
          >
            {/* Barra de ações (aparece no hover) */}
            {!m.deleted && !editandoEsta && (
              <div
                className={`absolute -top-3 ${
                  isMe ? "left-2" : "right-2"
                } flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/95 px-1.5 py-1 opacity-0 shadow-lg transition group-hover:opacity-100`}
              >
                <button
                  type="button"
                  title="Responder"
                  onClick={() => setReplyingTo(m)}
                  className="rounded-full p-1 text-slate-300 hover:text-fuchsia-300"
                >
                  <Icon d={D.responder} className="h-4 w-4" />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    title="Reagir"
                    onClick={() => setReactOpenId(reactOpenId === m.id ? null : m.id)}
                    className="rounded-full p-1 text-slate-300 hover:text-fuchsia-300"
                  >
                    <Icon d={D.emoji} className="h-4 w-4" />
                  </button>
                  {reactOpenId === m.id && (
                    <div className="absolute bottom-full left-1/2 z-10 mb-1 flex -translate-x-1/2 gap-1 rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => reagir(m.id, emoji)}
                          className="rounded-lg px-1 text-lg transition hover:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isMe && (
                  <button
                    type="button"
                    title="Editar"
                    onClick={() => setEditing({ id: m.id, text: m.text })}
                    className="rounded-full p-1 text-slate-300 hover:text-fuchsia-300"
                  >
                    <Icon d={D.editar} className="h-4 w-4" />
                  </button>
                )}
                {podeExcluir(id, m) && (
                  <button
                    type="button"
                    title="Apagar"
                    onClick={() => setToDelete(m)}
                    className="rounded-full p-1 text-slate-300 hover:text-red-400"
                  >
                    <Icon d={D.lixo} className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            <p className={`text-xs font-semibold ${isMe ? "text-white/90" : "text-fuchsia-300"}`}>
              {isMe ? "Você" : m.sender}
            </p>

            {m.replyTo && !m.deleted && (
              <div
                className={`mt-1.5 rounded-xl border-l-2 px-3 py-1.5 text-xs ${
                  isMe
                    ? "border-white/60 bg-white/15 text-white/90"
                    : "border-fuchsia-500/60 bg-slate-900/70 text-slate-300"
                }`}
              >
                <span className="block font-semibold">{m.replyTo.sender}</span>
                <span className="line-clamp-2 opacity-80">{m.replyTo.text || "Anexo"}</span>
              </div>
            )}

            {m.deleted ? (
              <p className="mt-1 text-sm italic opacity-70">mensagem apagada</p>
            ) : editandoEsta ? (
              <div className="mt-1">
                <textarea
                  value={editing.text}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                  rows={2}
                  className="w-64 max-w-full resize-none rounded-xl border border-white/40 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none"
                />
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={salvarEdicao}
                    className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-white/30"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-lg px-3 py-1 text-xs text-white/80 hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {m.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImagemAmpliada(m.imageUrl)}
                    className="mt-2 block overflow-hidden rounded-2xl"
                    title="Ampliar imagem"
                  >
                    <img
                      src={m.imageUrl}
                      alt="Imagem enviada no chat"
                      className="max-h-64 w-auto cursor-zoom-in object-cover transition duration-300 hover:scale-[1.03]"
                    />
                  </button>
                )}
                {m.audioUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={isMe ? "text-white/90" : "text-fuchsia-300"}>
                      <Icon d={D.microfone} className="h-4 w-4" />
                    </span>
                    <audio
                      controls
                      src={m.audioUrl}
                      className="h-9 w-52 max-w-full"
                    />
                    {m.duracao ? (
                      <span className="text-[11px] opacity-70">
                        {formataSegundos(m.duracao)}
                      </span>
                    ) : null}
                  </div>
                )}
                {m.text && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm">{m.text}</p>
                )}
              </>
            )}

            {!editandoEsta && (
              <div
                className={`mt-1 flex items-center gap-2 text-[11px] ${
                  isMe ? "text-white/70" : "text-slate-500"
                }`}
                title={new Date(m.createdAt).toLocaleString("pt-BR")}
              >
                <span>{formatarHora(m.createdAt)}</span>
                {m.editedAt && <span>· editada</span>}
                {isMe && !m.deleted && (
                  <span>· {outrosLeram > 0 ? "✓✓ Visto" : "✓ Enviado"}</span>
                )}
              </div>
            )}
          </div>

          {reacoes.length > 0 && (
            <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? "justify-end" : ""}`}>
              {reacoes.map(([emoji, users]) => {
                const euReagi = users.includes(uid);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => reagir(m.id, emoji)}
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
                      euReagi
                        ? "border-fuchsia-500/60 bg-fuchsia-500/20 text-fuchsia-200"
                        : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-fuchsia-500/40"
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{users.length}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {isMe && (
          <Avatar nome={usuario?.nome || "Você"} foto={usuario?.foto_perfil} size="h-8 w-8" />
        )}
      </div>
    );
  }

  // ─────────────────────────── lista com dias e divisor ───────────────────────────

  const visiveis = search.trim()
    ? messages.filter(
        (m) =>
          !m.deleted &&
          (m.text || "").toLowerCase().includes(search.trim().toLowerCase()),
      )
    : messages;

  function renderLista() {
    if (!messages.length) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
          <Icon d={D.emoji} className="h-10 w-10 text-fuchsia-400" />
          <p className="text-sm">Nenhuma mensagem ainda.</p>
          <p className="text-xs">Seja o primeiro a falar com os participantes!</p>
        </div>
      );
    }
    if (search.trim() && !visiveis.length) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Nenhuma mensagem encontrada para “{search.trim()}”.
        </div>
      );
    }

    let ultimoDia = null;
    const els = [];
    visiveis.forEach((m) => {
      const dia = rotuloDia(m.createdAt);
      if (dia !== ultimoDia) {
        els.push(
          <div key={`dia-${m.id}`} className="flex justify-center py-1">
            <span className="rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-300 backdrop-blur">
              {dia}
            </span>
          </div>,
        );
        ultimoDia = dia;
      }
      if (m.id === firstUnreadId && !search.trim()) {
        els.push(
          <div key={`novas-${m.id}`} className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-fuchsia-500/40" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-fuchsia-400">
              Novas mensagens
            </span>
            <div className="h-px flex-1 bg-fuchsia-500/40" />
          </div>,
        );
      }
      els.push(renderMensagem(m));
    });
    return els;
  }

  const restante = MAX_MSG - newMessage.length;

  return (
    <>
      <ModalConfirmacao
        aberto={toDelete !== null}
        titulo="Apagar mensagem"
        mensagem="Deseja apagar esta mensagem? Ela ficará marcada como apagada para todos."
        textoConfirmar="Apagar"
        perigo
        onConfirmar={confirmarExclusao}
        onCancelar={() => setToDelete(null)}
      />

      {/* Aviso: o papel de parede é compartilhado por todo o grupo */}
      <ModalConfirmacao
        aberto={papelPendente !== null}
        titulo="Papel de parede do grupo"
        mensagem="O papel de parede é compartilhado: ao aplicar, TODOS os participantes do grupo passarão a ver o mesmo. Deseja aplicar para todos?"
        textoConfirmar="Aplicar para todos"
        onConfirmar={() => {
          escolherPapel(papelPendente);
          setPapelPendente(null);
        }}
        onCancelar={() => setPapelPendente(null)}
      />

      {/* Ajuste da imagem de papel de parede (mesmo ajustador do resto do site) */}
      {ajustarSrc && (
        <ImageAdjuster
          src={ajustarSrc}
          aspect={4 / 5}
          outputWidth={900}
          onCancel={() => setAjustarSrc(null)}
          onConfirm={(dataUrl) => {
            setAjustarSrc(null);
            pedirPapel(dataUrl);
          }}
        />
      )}

      {/* Imagem ampliada */}
      {imagemAmpliada && (
        <div
          className="lightbox-fade fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur"
          onClick={() => setImagemAmpliada(null)}
        >
          <button
            type="button"
            onClick={() => setImagemAmpliada(null)}
            aria-label="Fechar"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur transition hover:bg-slate-800"
          >
            <Icon d={D.fechar} />
          </button>
          <img
            src={imagemAmpliada}
            alt="Imagem do chat"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl shadow-black/50"
          />
        </div>
      )}

      <main className="flex flex-1 flex-col px-6 py-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
          {/* Cabeçalho da página */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div>
              <p className="texto-gradiente-2 text-xs font-semibold uppercase tracking-[0.3em]">
                Chat do evento
              </p>
              <h1 className="text-2xl font-semibold text-white">
                <TituloDegrade texto={evento.titulo} />
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {evento.data} · {evento.local}
              </p>
            </div>
            <Link
              to={`/eventos/${evento.id}`}
              className="group inline-flex shrink-0 items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
            >
              <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Voltar ao evento
            </Link>
          </div>

          {/* Card do chat — ocupa o restante da página (animação padrão dos blocos) */}
          <section className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
            {/* Barra superior: clicar leva ao gerenciamento do grupo */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-800/70 px-5 py-3">
              <Link
                to={`/eventos/${evento.id}/grupo`}
                className="group flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/5"
                title="Gerenciar grupo"
              >
                <Avatar nome={nomeGrupo} foto={fotoGrupo} size="h-11 w-11" />
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-white">{nomeGrupo}</p>
                  <p className="truncate text-xs text-slate-400">
                    {participants.length}{" "}
                    {participants.length === 1 ? "participante" : "participantes"} ·
                    toque para ver o grupo
                  </p>
                </div>
                <span className="text-slate-500 transition group-hover:translate-x-0.5">
                  <Icon d={D.chevron} className="h-4 w-4" />
                </span>
              </Link>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  title="Papel de parede"
                  onClick={() => {
                    setShowWall((v) => !v);
                    setShowSearch(false);
                  }}
                  className={`rounded-2xl border border-slate-700 p-2 transition hover:border-fuchsia-500/50 hover:text-fuchsia-300 ${
                    showWall ? "text-fuchsia-300" : "text-slate-300"
                  }`}
                >
                  <Icon d={D.papel} />
                </button>
                <button
                  type="button"
                  title="Buscar mensagens"
                  onClick={() => {
                    setShowSearch((v) => !v);
                    setShowWall(false);
                    setSearch("");
                  }}
                  className={`rounded-2xl border border-slate-700 p-2 transition hover:border-fuchsia-500/50 hover:text-fuchsia-300 ${
                    showSearch ? "text-fuchsia-300" : "text-slate-300"
                  }`}
                >
                  <Icon d={D.busca} />
                </button>
              </div>
            </div>

            {/* Busca */}
            {showSearch && (
              <div className="border-b border-slate-800/70 px-5 py-3">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar nas mensagens…"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25"
                />
              </div>
            )}

            {/* Papel de parede */}
            {showWall && (
              <div className="border-b border-slate-800/70 bg-slate-950/40 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Papel de parede
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-fuchsia-400">⚠</span>
                  É compartilhado: todos os participantes do grupo verão o mesmo.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {WALLPAPERS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => pedirPapel(w.id)}
                      title={w.label}
                      style={{
                        backgroundColor: w.base || "transparent",
                        backgroundImage: w.css,
                      }}
                      className={`h-14 w-14 rounded-2xl border-2 transition hover:scale-105 ${
                        papel === w.id
                          ? "border-fuchsia-500 ring-2 ring-fuchsia-500/40"
                          : "border-slate-700"
                      }`}
                    />
                  ))}
                  <input
                    ref={wallFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleWallpaperFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => wallFileRef.current?.click()}
                    title="Enviar imagem"
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-slate-300 transition hover:scale-105 hover:border-fuchsia-500/60 hover:text-fuchsia-300 ${
                      papel.startsWith("data:")
                        ? "border-fuchsia-500 ring-2 ring-fuchsia-500/40"
                        : "border-dashed border-slate-600"
                    }`}
                  >
                    <Icon d={D.imagem} />
                  </button>
                </div>
              </div>
            )}

            {/* Mensagens (ocupa todo o espaço restante) */}
            <div
              className="flex-1 space-y-3 overflow-y-auto px-5 py-5"
              style={estiloPapelDeParede(papel)}
            >
              {renderLista()}
              <div ref={bottomRef} />
            </div>

            {/* Barra de resposta */}
            {replyingTo && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-800/70 bg-slate-950/60 px-5 py-2">
                <div className="min-w-0 border-l-2 border-fuchsia-500 pl-3">
                  <p className="text-xs font-semibold text-fuchsia-300">
                    Respondendo a {replyingTo.ownerId === uid ? "você" : replyingTo.sender}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {replyingTo.text || "Anexo"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="rounded-full p-1 text-slate-400 hover:text-white"
                >
                  <Icon d={D.fechar} className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Composer */}
            <div className="border-t border-slate-800/70 px-5 py-4">
              {erroGrav && (
                <p className="mb-2 text-xs text-red-300">{erroGrav}</p>
              )}

              {gravando ? (
                /* Barra de gravação de áudio */
                <div className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3">
                  <button
                    type="button"
                    onClick={cancelarGravacao}
                    title="Cancelar gravação"
                    className="rounded-full p-2 text-slate-300 transition hover:text-red-300"
                  >
                    <Icon d={D.lixo} />
                  </button>
                  <span className="flex items-center gap-2 text-sm font-medium text-red-200">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                    Gravando… {formataSegundos(segundos)}
                  </span>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={pararEEnviar}
                    title="Enviar áudio"
                    className="shrink-0 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 p-3 text-white shadow-lg shadow-fuchsia-500/20 transition hover:scale-105 active:scale-95"
                  >
                    <Icon d={D.enviar} />
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />
                  <button
                    type="button"
                    title="Enviar imagem"
                    onClick={() => fileRef.current?.click()}
                    className="shrink-0 rounded-2xl border border-slate-700 p-3 text-slate-300 transition hover:border-fuchsia-500/50 hover:text-fuchsia-300"
                  >
                    <Icon d={D.imagem} />
                  </button>
                  <button
                    type="button"
                    title="Gravar áudio"
                    onClick={iniciarGravacao}
                    className="shrink-0 rounded-2xl border border-slate-700 p-3 text-slate-300 transition hover:border-fuchsia-500/50 hover:text-fuchsia-300"
                  >
                    <Icon d={D.microfone} />
                  </button>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value.slice(0, MAX_MSG))}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Enviar mensagem…  (Enter envia, Shift+Enter quebra linha)"
                    className="max-h-32 min-h-[48px] w-full resize-y rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="shrink-0 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 p-3 text-white shadow-lg shadow-fuchsia-500/20 transition hover:scale-105 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Icon d={D.enviar} />
                  </button>
                </div>
              )}

              {!gravando && newMessage.length > MAX_MSG * 0.8 && (
                <p
                  className={`mt-1 text-right text-xs ${
                    restante < 0 ? "text-red-400" : "text-slate-500"
                  }`}
                >
                  {restante} caracteres restantes
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
