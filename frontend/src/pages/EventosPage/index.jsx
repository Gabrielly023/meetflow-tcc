import { useState } from "react";
import { Link } from "react-router-dom";
import SideBar from "../../components/SideBar";
import Header from "../../components/Header";
import EventCover from "../../components/EventCover";
import {
  listarEventos,
  listarLixeiraEventos,
  restaurarEvento,
} from "../../services/eventoService";

export default function EventosPage() {
  const [verLixeira, setVerLixeira] = useState(false);
  const [, setAtualizar] = useState(0);

  const eventos = listarEventos();
  const lixeira = listarLixeiraEventos();

  function handleRestaurar(id) {
    restaurarEvento(id);
    setAtualizar((v) => v + 1);
  }

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
                  {verLixeira ? "Lixeira" : "Seus eventos"}
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  {verLixeira
                    ? "Eventos na lixeira"
                    : "Eventos que você já tem"}
                </h1>
              </div>

              <div className="flex flex-wrap gap-3">
                {!verLixeira ? (
                  <>
                    <Link
                      to="/eventos/novo"
                      className="group inline-flex items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                    >
                      <span className="inline-block text-base leading-none transition-transform duration-300 group-hover:rotate-90">
                        +
                      </span>
                      Novo evento
                    </Link>

                    <button
                      type="button"
                      onClick={() => setVerLixeira(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition duration-300 hover:scale-105 hover:bg-slate-800 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Lixeira
                      {lixeira.length > 0 && (
                        <span className="ml-1 rounded-full bg-fuchsia-500/20 px-2 text-xs text-fuchsia-300">
                          {lixeira.length}
                        </span>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVerLixeira(false)}
                    className="group inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition duration-300 hover:scale-105 hover:bg-slate-800 active:scale-95"
                  >
                    <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                      ←
                    </span>
                    Voltar aos eventos
                  </button>
                )}
              </div>
            </div>

            {/* ================= LIXEIRA ================= */}
            {verLixeira ? (
              lixeira.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-16 text-center text-slate-300">
                  A lixeira de eventos está vazia.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {lixeira.map((evento) => (
                    <div
                      key={evento.id}
                      className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-black/20"
                    >
                      <div className="opacity-60">
                        <EventCover
                          capa={evento.capa}
                          tipo={evento.tipo}
                          titulo={evento.titulo}
                          heightClass="h-36"
                        />
                      </div>
                      <div className="p-6">
                        <span className="inline-block rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                          {evento.motivo === "excluido"
                            ? "Excluído por você"
                            : "Você saiu"}
                        </span>
                        <h2 className="mt-3 text-lg font-semibold text-white">
                          {evento.titulo}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                          {evento.data}
                          {evento.local ? ` · ${evento.local}` : ""}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRestaurar(evento.id)}
                          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90"
                        >
                          Restaurar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : /* ================= EVENTOS ================= */
            eventos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-16 text-center text-slate-300">
                Você ainda não tem eventos.
              </div>
            ) : (
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
            )}
          </div>
        </main>
      </div>
    </>
  );
}
