import { Link } from "react-router-dom";
import SideBar from "../../components/SideBar";
import Header from "../../components/Header";
import EventCover from "../../components/EventCover";
import { listarEventos } from "../../services/eventoService";

export default function EventosPage() {
  const eventos = listarEventos();

  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
        <SideBar />
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">
                  Seus eventos
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  Eventos que você já tem
                </h1>
              </div>
              <Link
                to="/eventos/novo"
                className="group inline-flex items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
              >
                <span className="inline-block text-base leading-none transition-transform duration-300 group-hover:rotate-90">
                  +
                </span>
                Novo evento
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {eventos.map((evento, index) => (
                <Link key={evento.id} to={`/eventos/${evento.id}`} className="group block overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50">
                  <EventCover
                    capa={evento.capa}
                    tipo={evento.tipo}
                    titulo={evento.titulo}
                    heightClass="h-40"
                    imgClass="transition duration-300 group-hover:scale-105"
                  />
                  <div className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-white shadow-lg shadow-fuchsia-500/20">
                        {evento.tipo}
                      </span>
                      <span className="text-sm text-slate-400">#{index + 1}</span>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-orange-500/20 via-fuchsia-500/20 to-sky-500/20 p-4">
                      <h2 className="text-xl font-semibold text-white">{evento.titulo}</h2>
                      <p className="mt-3 text-sm text-slate-300">{evento.data}</p>
                      <p className="mt-1 text-sm text-slate-400">{evento.local}</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                      <span>Confirmado</span>
                      <span className="text-fuchsia-400 transition group-hover:text-sky-400">
                        Ver detalhes →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
