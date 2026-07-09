import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import EventChat from "../../components/EventChat";
import EventGallery from "../../components/EventGallery";
import EventMap from "../../components/EventMap";
import EventPlaylist from "../../components/EventPlaylist";
import EventCover from "../../components/EventCover";
import ModalConfirmacao from "../../components/ModalConfirmacao";
import TituloDegrade from "../../components/TituloDegrade";
import {
  buscarEventoPorId,
  isDono,
  excluirEvento,
  sairDoEvento,
} from "../../services/eventoService";
import { listarParticipantes } from "../../services/chatService";

// Contagem regressiva até o evento (em dias de calendário).
function calcularContagem(dataHora) {
  if (!dataHora) return { titulo: "Sem data", sub: "defina a data do evento" };
  const alvo = new Date(dataHora);
  if (Number.isNaN(alvo.getTime())) {
    return { titulo: "Sem data", sub: "defina a data do evento" };
  }
  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioAlvo = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate());
  const dias = Math.round((inicioAlvo - inicioHoje) / 86400000);
  if (dias > 1) return { titulo: `Faltam ${dias} dias`, sub: "para o evento" };
  if (dias === 1) return { titulo: "Amanhã!", sub: "é quase lá" };
  if (dias === 0) return { titulo: "É hoje!", sub: "o grande dia chegou" };
  const passados = Math.abs(dias);
  return {
    titulo: "Já aconteceu",
    sub: `há ${passados} ${passados === 1 ? "dia" : "dias"}`,
  };
}

export default function EventoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = buscarEventoPorId(id);
  const [modal, setModal] = useState(null);

  if (!evento) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="rounded-3xl border border-red-500/40 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/30">
            <h1 className="text-3xl font-semibold">Evento não encontrado</h1>
            <p className="mt-4 text-slate-300">Verifique se o link está correto ou volte para a página de eventos.</p>
            <Link to="/eventos" className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
              Voltar para eventos
            </Link>
          </div>
      </main>
    );
  }

  const dono = isDono(evento);
  const contagem = calcularContagem(evento.dataHora);
  const numParticipantes = listarParticipantes(evento.id).length;

  function confirmarModal() {
    if (modal === "excluir") {
      excluirEvento(evento.id);
      navigate("/eventos");
    } else if (modal === "sair") {
      sairDoEvento(evento.id);
      navigate("/eventos");
    }
    setModal(null);
  }

  return (
    <>
      <ModalConfirmacao
        aberto={modal !== null}
        titulo={modal === "excluir" ? "Excluir evento" : "Sair do evento"}
        mensagem={
          modal === "excluir"
            ? `Tem certeza que deseja excluir "${evento.titulo}"? Essa ação não pode ser desfeita.`
            : `Deseja sair de "${evento.titulo}"? Ele deixará de aparecer na sua conta.`
        }
        textoConfirmar={modal === "excluir" ? "Excluir" : "Sair"}
        perigo={modal === "excluir"}
        onConfirmar={confirmarModal}
        onCancelar={() => setModal(null)}
      />

      <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
              <EventCover
                capa={evento.capa}
                tipo={evento.tipo}
                titulo={evento.titulo}
                heightClass="h-56"
              />
              <div className="p-8">
              <div className="mb-6 flex flex-col items-center gap-4 text-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em]">
                    <span className="text-white">Detalhes do </span>
                    <span className="texto-gradiente-2">evento</span>
                  </p>
                  <h1 className="text-4xl font-semibold text-white"><TituloDegrade texto={evento.titulo} /></h1>
                  <p className="mt-2 text-sm text-slate-400">{evento.data} · {evento.local}</p>
                  {evento.dataFim && (
                    <p className="mt-1 text-xs text-slate-500">Término: {evento.dataFim}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/eventos/${evento.id}/editar`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-90"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                      />
                    </svg>
                    Editar evento
                  </Link>
                  <Link
                    to="/eventos"
                    className="group inline-flex items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                  >
                    <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                      ←
                    </span>
                    Voltar aos eventos
                  </Link>
                </div>
              </div>
              {evento.descricao && (
                <div className="mb-6 flex flex-col items-center rounded-3xl border border-slate-800/70 bg-slate-950/40 p-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-400">
                    Sobre o evento
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
                    {evento.descricao}
                  </p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Coluna esquerda: Tipo (em cima) + Participantes (embaixo) */}
                <div className="grid gap-4">
                  {/* Tipo */}
                  <div className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-orange-500/15 via-fuchsia-500/15 to-sky-500/15 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                      </svg>
                      <p className="text-xs uppercase tracking-[0.3em]">Tipo</p>
                    </div>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {evento.tipo || "—"}
                    </p>
                  </div>
                  {/* Participantes */}
                  <div className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-sky-500/15 via-violet-500/15 to-fuchsia-500/15 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      <p className="text-xs uppercase tracking-[0.3em]">Participantes</p>
                    </div>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {numParticipantes}{" "}
                      <span className="text-sm font-normal text-slate-400">
                        {numParticipantes === 1 ? "pessoa" : "pessoas"}
                      </span>
                    </p>
                  </div>
                </div>
                {/* Contagem regressiva (ocupa a altura das duas ao lado) */}
                <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-violet-500 p-6 text-center shadow-lg shadow-violet-500/20">
                  <div className="flex items-center justify-center gap-2 text-white/80">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs uppercase tracking-[0.3em]">Contagem regressiva</p>
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-white">{contagem.titulo}</p>
                  <p className="text-sm text-white/80">{contagem.sub}</p>
                </div>
              </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <EventChat eventoId={evento.id} />
                <EventGallery eventoId={evento.id} />
              </div>
              <div className="space-y-6">
                <EventMap eventoId={evento.id} location={evento.local} />
                <EventPlaylist playlist={evento.playlist} eventoId={evento.id} />
              </div>
            </div>

            {/* AÇÕES DO EVENTO */}
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">
                    Ações do evento
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {dono
                      ? "Como organizador, você pode excluir este evento definitivamente."
                      : "Você pode sair deste evento a qualquer momento; ele deixará de aparecer na sua conta."}
                  </p>
                </div>

                {dono ? (
                  <button
                    type="button"
                    onClick={() => setModal("excluir")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500/90 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                    Excluir evento
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModal("sair")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    Sair do evento
                  </button>
                )}
              </div>
            </div>
          </div>
      </main>
    </>
  );
}
