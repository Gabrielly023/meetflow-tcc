import { Link } from "react-router-dom";
import { listarEventos, ordenarPorData } from "../../services/eventoService";
import { getLocalPrincipal, listarLocais } from "../../services/mapaService";

export default function MapasGerais() {
  const eventos = ordenarPorData(listarEventos());
  const totalLocais = eventos.reduce(
    (soma, ev) => soma + listarLocais(ev.id).length,
    0,
  );

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="texto-gradiente-2 text-sm font-semibold uppercase tracking-[0.3em]">
              Mapas
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Meus <span className="texto-gradiente">mapas</span>
            </h1>
            <p className="mt-2 text-slate-400">
              A localização de cada evento no mapa, tudo reunido num só lugar.
              Clique em um para ver e adicionar locais.
            </p>
          </div>

          {/* Bloquinho com o total de locais marcados — borda em degradê roxo→azul */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 p-[1.5px] shadow-lg shadow-violet-500/25">
            <div className="rounded-2xl bg-slate-900 px-5 py-3 text-center">
              <p className="texto-gradiente-2 text-2xl font-semibold">
                {totalLocais}
              </p>
              <p className="text-xs text-slate-400">
                {totalLocais === 1 ? "local marcado" : "locais marcados"}
              </p>
            </div>
          </div>
        </div>

        {eventos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-16 text-center text-slate-300">
            Você ainda não tem eventos.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento) => {
              const principal = getLocalPrincipal(evento.id);
              const temMapa = Boolean(principal && principal.embedUrl);
              const qtd = listarLocais(evento.id).length;

              return (
                <div
                  key={evento.id}
                  className="group overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
                >
                  {/* Mapa: só aparece se o evento já tiver um local adicionado */}
                  {temMapa ? (
                    <div className="relative">
                      <iframe
                        title={`Mapa de ${evento.titulo}`}
                        src={principal.embedUrl}
                        className="pointer-events-none aspect-[16/10] w-full"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <Link
                        to={`/eventos/${evento.id}/mapa`}
                        aria-label={`Abrir mapa de ${evento.titulo}`}
                        className="absolute inset-0"
                      />
                    </div>
                  ) : (
                    <Link
                      to={`/eventos/${evento.id}/mapa`}
                      className="flex aspect-[16/10] flex-col items-center justify-center gap-2 border-b border-dashed border-slate-700 bg-slate-950/60 text-center text-slate-300 transition duration-300 hover:bg-slate-900/60 hover:text-white"
                    >
                      <span className="text-fuchsia-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-8 w-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium">Adicionar localização</span>
                    </Link>
                  )}

                  <Link
                    to={`/eventos/${evento.id}/mapa`}
                    className="flex items-center justify-between gap-3 p-5 transition hover:bg-slate-900/60"
                  >
                    <div className="min-w-0">
                      <h2 className="truncate texto-gradiente-2 text-lg font-semibold">
                        {evento.titulo}
                      </h2>
                      <p className="mt-1 truncate text-sm text-slate-400">
                        {principal?.label || evento.local || "Sem endereço"}
                      </p>
                      {qtd > 0 && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {qtd} {qtd === 1 ? "local marcado" : "locais marcados"}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-fuchsia-400 transition group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
