import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import EventChat from "../../components/EventChat";
import EventGallery from "../../components/EventGallery";
import EventMap from "../../components/EventMap";
import EventPlaylist from "../../components/EventPlaylist";
import EventCover from "../../components/EventCover";
import {
  buscarEventoPorId,
  isDono,
  excluirEvento,
  sairDoEvento,
} from "../../services/eventoService";

export default function EventoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = buscarEventoPorId(id);

  if (!evento) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-10">
          <div className="rounded-3xl border border-red-500/40 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/30">
            <h1 className="text-3xl font-semibold">Evento não encontrado</h1>
            <p className="mt-4 text-slate-300">Verifique se o link está correto ou volte para a página de eventos.</p>
            <Link to="/eventos" className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
              Voltar para eventos
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const dono = isDono(evento);

  function handleExcluir() {
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir o evento "${evento.titulo}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;
    excluirEvento(evento.id);
    navigate("/eventos");
  }

  function handleSair() {
    const confirmado = window.confirm(
      `Deseja sair do evento "${evento.titulo}"? Ele deixará de aparecer na sua conta.`,
    );
    if (!confirmado) return;
    sairDoEvento(evento.id);
    navigate("/eventos");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <div className="flex min-h-[calc(100vh-80px)]">
        <SideBar />
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-black/20">
              <EventCover
                capa={evento.capa}
                tipo={evento.tipo}
                titulo={evento.titulo}
                heightClass="h-56"
              />
              <div className="p-8">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Detalhes do evento</p>
                  <h1 className="text-4xl font-semibold text-white">{evento.titulo}</h1>
                  <p className="mt-2 text-sm text-slate-400">{evento.data} · {evento.local}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {isDono(evento) && (
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
                  )}
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
                <p className="mb-6 text-sm leading-relaxed text-slate-300">
                  {evento.descricao}
                </p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-gradient-to-br from-orange-500/15 via-fuchsia-500/15 to-sky-500/15 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tipo</p>
                  <p className="mt-4 text-2xl font-semibold text-white">{evento.tipo}</p>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-sky-500 to-violet-500 p-6 shadow-lg shadow-violet-500/20">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/80">Status</p>
                  <p className="mt-4 text-2xl font-semibold text-white">Pronto para gerenciamento</p>
                </div>
              </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <EventChat initialParticipants={evento.participants} initialMessages={evento.messages} />
                <EventGallery images={evento.images} />
              </div>
              <div className="space-y-6">
                <EventMap location={evento.local} />
                <EventPlaylist playlist={evento.playlist} />
              </div>
            </div>

            {/* AÇÕES DO EVENTO */}
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
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
                    onClick={handleExcluir}
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
                    onClick={handleSair}
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
      </div>
    </div>
  );
}
