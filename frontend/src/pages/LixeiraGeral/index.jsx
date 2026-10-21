import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventCover from "../../components/EventCover";
import { listarEventos, ordenarPorData } from "../../services/eventoService";

export default function LixeiraGeral() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    Promise.resolve()
      .then(() => listarEventos())
      .then((dados) => {
        if (ativo) setEventos(ordenarPorData(dados));
      })
      .catch((erroEventos) => {
        console.error("Erro ao carregar eventos para a lixeira geral:", erroEventos);
        if (ativo) {
          setErro("Não foi possível carregar os eventos.");
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="text-center">
          <p className="texto-gradiente-2 text-sm font-semibold uppercase tracking-[0.3em]">
            Itens excluídos
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Lixeira <span className="texto-gradiente">geral</span>
          </h1>
          <p className="mt-3 text-slate-400">
            Acesse eventos excluídos ou as fotos removidas das galerias.
          </p>
        </header>

        {erro && (
          <p
            role="alert"
            className="rounded-2xl border border-red-500/40 bg-red-900/40 px-4 py-3 text-sm text-red-200"
          >
            {erro}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Link
            to="/eventos/lixeira"
            className="group flex min-h-56 flex-col justify-between rounded-3xl border border-slate-800/70 bg-slate-900/70 p-7 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 text-fuchsia-300">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7h16m-10 4v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
                  />
                </svg>
              </span>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                Eventos
              </span>
            </div>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Eventos excluídos
                </h2>
                <p className="mt-2 max-w-sm text-sm text-slate-400">
                  Restaure eventos ou exclua-os permanentemente.
                </p>
              </div>
              <span className="text-2xl text-fuchsia-400 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-7 shadow-xl shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="texto-gradiente-2 text-xs font-semibold uppercase tracking-[0.25em]">
                  Galerias
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Fotos excluídas
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Escolha um evento para abrir a lixeira da galeria.
                </p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 text-sky-300">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5v-11zM3 15l4.5-4.5a2.12 2.12 0 013 0l1.5 1.5m1.5 1.5l1.5-1.5a2.12 2.12 0 013 0L21 16.5M8.25 9h.008v.008H8.25V9z"
                  />
                </svg>
              </span>
            </div>

            {carregando ? (
              <p role="status" className="mt-6 text-sm text-slate-400">
                Carregando eventos…
              </p>
            ) : eventos.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
                Você ainda não tem eventos com galerias.
              </div>
            ) : (
              <div className="mt-6 max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                {eventos.map((evento) => (
                  <Link
                    key={evento.id}
                    to={`/eventos/${evento.id}/galeria/lixeira`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-fuchsia-500/40 hover:bg-slate-900"
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                      <EventCover
                        capa={evento.capa}
                        tipo={evento.tipo}
                        titulo={evento.titulo}
                        heightClass="h-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white">
                        {evento.titulo}
                      </h3>
                      <p className="mt-1 truncate text-sm text-slate-400">
                        {evento.data || "Abrir lixeira da galeria"}
                      </p>
                    </div>
                    <span className="text-xl text-fuchsia-400 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
