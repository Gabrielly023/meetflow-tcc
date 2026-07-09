import { useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { buscarEventoPorId, sairDoEvento } from "../../services/eventoService";
import { getUsuarioLogado } from "../../services/usuarioService";
import {
  listarParticipantes,
  adicionarParticipante,
  removerParticipante,
  getNomeGrupo,
  setNomeGrupo,
  getDescricaoGrupo,
  setDescricaoGrupo,
  getFotoGrupo,
  setFotoGrupo,
  isParticipanteAdmin,
  souAdminGrupo,
  promoverAdmin,
  rebaixarAdmin,
  isOrganizador,
  arquivoParaDataUrl,
  iniciais,
  corDoNome,
} from "../../services/chatService";
import TituloDegrade from "../../components/TituloDegrade";
import ModalConfirmacao from "../../components/ModalConfirmacao";
import ImageAdjuster from "../../components/ImageAdjuster";

const Icon = ({ d, className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.7"
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const D = {
  editar:
    "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z",
  camera:
    "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z",
  lixo: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
  estrela:
    "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  sair: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75",
  salvar: "M4.5 12.75l6 6 9-13.5",
};

function Avatar({ nome, foto, size = "h-11 w-11" }) {
  if (foto) {
    return <img src={foto} alt={nome} className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <div
      className={`${size} shrink-0 rounded-full bg-gradient-to-br ${corDoNome(
        nome,
      )} flex items-center justify-center text-sm font-bold text-white`}
    >
      {iniciais(nome)}
    </div>
  );
}

// Selinho de papel (Criador / Admin).
function Badge({ children, cor = "fuchsia" }) {
  const cores = {
    fuchsia: "bg-fuchsia-500/15 text-fuchsia-300",
    sky: "bg-sky-500/15 text-sky-300",
    slate: "bg-slate-700/40 text-slate-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cores[cor]}`}>
      {children}
    </span>
  );
}

export default function GrupoEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = buscarEventoPorId(id);
  const usuario = getUsuarioLogado();

  const fotoRef = useRef(null);
  const [, setVersao] = useState(0);
  const recarregar = () => setVersao((n) => n + 1);

  const [editandoNome, setEditandoNome] = useState(false);
  const [nomeDraft, setNomeDraft] = useState("");
  const [editandoDesc, setEditandoDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [novoParticipante, setNovoParticipante] = useState("");
  const [erroPart, setErroPart] = useState("");
  const [aRemover, setARemover] = useState(null);
  const [sairAberto, setSairAberto] = useState(false);
  const [ajustarFotoSrc, setAjustarFotoSrc] = useState(null);

  if (!evento) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-red-500/40 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-semibold">Evento não encontrado</h1>
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

  const souDono = isOrganizador(id); // criador do evento
  const souAdmin = souAdminGrupo(id); // criador ou admin nomeado
  const nomeGrupo = getNomeGrupo(id, evento.titulo);
  const descricao = getDescricaoGrupo(id);
  const foto = getFotoGrupo(id);
  const participantes = listarParticipantes(id);

  const meuPapel = souDono ? "Criador" : souAdmin ? "Admin" : "Membro";

  // ─────────────────────── ações ───────────────────────

  function salvarNome() {
    setNomeGrupo(id, nomeDraft);
    setEditandoNome(false);
    recarregar();
  }
  function salvarDesc() {
    setDescricaoGrupo(id, descDraft);
    setEditandoDesc(false);
    recarregar();
  }

  // Lê a imagem e abre o ajustador (mesmo do resto do site); só aplica após
  // confirmar o recorte.
  async function trocarFoto(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo || !arquivo.type.startsWith("image/")) return;
    try {
      const dataUrl = await arquivoParaDataUrl(arquivo, 1000);
      setAjustarFotoSrc(dataUrl);
    } catch (erro) {
      console.error(erro);
    }
  }

  function handleAdicionar() {
    setErroPart("");
    const res = adicionarParticipante(id, novoParticipante);
    if (res?.erro === "duplicado") {
      setErroPart("Esse participante já está no grupo.");
      return;
    }
    if (res?.erro === "semPermissao") {
      setErroPart("Só admins podem adicionar participantes.");
      return;
    }
    if (res?.erro) return;
    setNovoParticipante("");
    recarregar();
  }

  function confirmarRemocao() {
    if (aRemover) {
      removerParticipante(id, aRemover.id);
      recarregar();
    }
    setARemover(null);
  }

  function alternarAdmin(p) {
    if (isParticipanteAdmin(id, p.id)) rebaixarAdmin(id, p.id);
    else promoverAdmin(id, p.id);
    recarregar();
  }

  function confirmarSaida() {
    sairDoEvento(id);
    setSairAberto(false);
    navigate("/chats");
  }

  return (
    <>
      <ModalConfirmacao
        aberto={aRemover !== null}
        titulo="Remover participante"
        mensagem={`Deseja remover "${aRemover?.name}" do grupo?`}
        textoConfirmar="Remover"
        perigo
        onConfirmar={confirmarRemocao}
        onCancelar={() => setARemover(null)}
      />
      <ModalConfirmacao
        aberto={sairAberto}
        titulo="Sair do grupo"
        mensagem={`Deseja sair de "${nomeGrupo}"? O evento deixará de aparecer na sua conta.`}
        textoConfirmar="Sair"
        perigo
        onConfirmar={confirmarSaida}
        onCancelar={() => setSairAberto(false)}
      />

      {/* Ajuste da foto do grupo (recorte redondo, mesmo ajustador do site) */}
      {ajustarFotoSrc && (
        <ImageAdjuster
          src={ajustarFotoSrc}
          aspect={1}
          round
          outputWidth={400}
          onCancel={() => setAjustarFotoSrc(null)}
          onConfirm={(dataUrl) => {
            setFotoGrupo(id, dataUrl);
            setAjustarFotoSrc(null);
            recarregar();
          }}
        />
      )}

      <main className="flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Cabeçalho */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div>
              <p className="texto-gradiente-2 text-xs font-semibold uppercase tracking-[0.3em]">
                Gerenciar grupo
              </p>
              <h1 className="text-2xl font-semibold text-white">
                <TituloDegrade texto={nomeGrupo} />
              </h1>
            </div>
            <Link
              to={`/eventos/${evento.id}/chat`}
              className="group inline-flex shrink-0 items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
            >
              <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Voltar ao chat
            </Link>
          </div>

          {/* Identidade do grupo */}
          <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
            <div className="flex flex-col items-center gap-4 text-center">
              {/* Foto do grupo */}
              <div className="relative">
                <Avatar nome={nomeGrupo} foto={foto} size="h-24 w-24" />
                {souAdmin && (
                  <>
                    <input
                      ref={fotoRef}
                      type="file"
                      accept="image/*"
                      onChange={trocarFoto}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fotoRef.current?.click()}
                      title="Trocar foto do grupo"
                      className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 text-white shadow-lg transition hover:scale-105"
                    >
                      <Icon d={D.camera} className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Nome do grupo (editável por admin) */}
              {editandoNome ? (
                <div className="flex w-full max-w-sm items-center gap-2">
                  <input
                    autoFocus
                    value={nomeDraft}
                    onChange={(e) => setNomeDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && salvarNome()}
                    placeholder="Nome do grupo"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-center text-lg text-white outline-none focus:border-fuchsia-500"
                  />
                  <button
                    type="button"
                    onClick={salvarNome}
                    className="shrink-0 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 p-2.5 text-white transition hover:scale-105"
                  >
                    <Icon d={D.salvar} className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold text-white">{nomeGrupo}</h2>
                  {souAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setNomeDraft(nomeGrupo);
                        setEditandoNome(true);
                      }}
                      title="Editar nome do grupo"
                      className="text-slate-400 transition hover:text-fuchsia-300"
                    >
                      <Icon d={D.editar} className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500">
                Grupo do evento “{evento.titulo}” · {evento.data} · {participantes.length}{" "}
                {participantes.length === 1 ? "participante" : "participantes"}
              </p>

              {/* Descrição (editável por admin) */}
              <div className="w-full max-w-lg">
                {editandoDesc ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={descDraft}
                      onChange={(e) => setDescDraft(e.target.value)}
                      rows={3}
                      placeholder="Descrição do grupo…"
                      className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 outline-none focus:border-fuchsia-500"
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={salvarDesc}
                        className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditandoDesc(false)}
                        className="rounded-2xl border border-slate-700 px-4 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!souAdmin) return;
                      setDescDraft(descricao);
                      setEditandoDesc(true);
                    }}
                    className={`w-full rounded-2xl px-4 py-2 text-sm ${
                      souAdmin ? "transition hover:bg-white/5" : "cursor-default"
                    } ${descricao ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {descricao || (souAdmin ? "Adicionar uma descrição ao grupo…" : "Sem descrição.")}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Participantes */}
          <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Participantes{" "}
                <span className="text-slate-500">({participantes.length + 1})</span>
              </h3>
            </div>

            {/* Adicionar participante (só admin) */}
            {souAdmin && (
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    value={novoParticipante}
                    onChange={(e) => setNovoParticipante(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
                    placeholder="Nome do participante"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none transition focus:border-fuchsia-500"
                  />
                  <button
                    type="button"
                    onClick={handleAdicionar}
                    className="shrink-0 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Adicionar
                  </button>
                </div>
                {erroPart && <p className="mt-2 text-xs text-red-300">{erroPart}</p>}
              </div>
            )}

            <div className="space-y-2">
              {/* Você */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-950/50 px-3 py-2">
                <Avatar nome={usuario?.nome || "Você"} foto={usuario?.foto_perfil} size="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {usuario?.nome || "Você"}{" "}
                    <span className="text-xs font-normal text-slate-500">(você)</span>
                  </p>
                </div>
                {meuPapel !== "Membro" && (
                  <Badge cor={souDono ? "fuchsia" : "sky"}>{meuPapel}</Badge>
                )}
              </div>

              {/* Demais participantes */}
              {participantes.map((p) => {
                const admin = isParticipanteAdmin(id, p.id);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-white/5"
                  >
                    <Avatar nome={p.name} size="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200">{p.name}</p>
                    </div>

                    {admin && <Badge cor="sky">Admin</Badge>}

                    {/* Só o criador nomeia/remove admins */}
                    {souDono && (
                      <button
                        type="button"
                        onClick={() => alternarAdmin(p)}
                        title={admin ? "Remover admin" : "Tornar admin"}
                        className={`rounded-full p-1.5 transition ${
                          admin
                            ? "text-sky-300 hover:text-slate-400"
                            : "text-slate-400 hover:text-sky-300"
                        }`}
                      >
                        <Icon d={D.estrela} className="h-4 w-4" />
                      </button>
                    )}

                    {/* Qualquer admin pode remover participante */}
                    {souAdmin && (
                      <button
                        type="button"
                        onClick={() => setARemover(p)}
                        title="Remover do grupo"
                        className="rounded-full p-1.5 text-slate-400 transition hover:text-red-400"
                      >
                        <Icon d={D.lixo} className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {!souAdmin && (
              <p className="mt-4 rounded-2xl bg-slate-950/50 px-4 py-3 text-xs text-slate-500">
                Apenas administradores do grupo podem adicionar ou remover
                participantes e editar o grupo.
              </p>
            )}
          </section>

          {/* Sair do grupo (quem não é o criador) */}
          {!souDono && (
            <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
              <button
                type="button"
                onClick={() => setSairAberto(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/40 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                <Icon d={D.sair} className="h-4 w-4" />
                Sair do grupo
              </button>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
