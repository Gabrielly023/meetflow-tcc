import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import EventChat from "../../components/EventChat";
import EventGallery from "../../components/EventGallery";
import EventMap from "../../components/EventMap";
import EventPlaylist from "../../components/EventPlaylist";
import { eventos } from "../../data/eventosData";

export default function EventoDetalhe() {
  const { id } = useParams();
  const evento = eventos.find((eventoItem) => String(eventoItem.id) === id);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <div className="flex min-h-[calc(100vh-80px)]">
        <SideBar />
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl shadow-black/20">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Detalhes do evento</p>
                  <h1 className="text-4xl font-semibold text-white">{evento.titulo}</h1>
                  <p className="mt-2 text-sm text-slate-400">{evento.data} · {evento.local}</p>
                </div>
                <Link
                  to="/eventos"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                >
                  Voltar aos eventos
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-gradient-to-br from-orange-500/15 via-fuchsia-500/15 to-sky-500/15 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tipo</p>
                  <p className="mt-4 text-2xl font-semibold text-white">{evento.tipo}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Status</p>
                  <p className="mt-4 text-2xl font-semibold text-white">Pronto para gerenciamento</p>
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
          </div>
        </main>
      </div>
    </div>
  );
}
