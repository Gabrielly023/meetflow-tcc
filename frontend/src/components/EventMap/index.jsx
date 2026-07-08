import { Link } from "react-router-dom";
import { getLocalPrincipal } from "../../services/mapaService";

const iconePin = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-8 w-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

// Prévia do mapa dentro do detalhe do evento.
// Só mostra o mini-mapa quando um participante já adicionou um local; caso
// contrário, exibe um convite para adicionar. O mapa grande a partir do
// endereço fica na página completa (/eventos/:id/mapa).
export default function EventMap({ eventoId, location = "Local do evento" }) {
  const principal = getLocalPrincipal(eventoId);
  const temMapa = Boolean(principal && principal.embedUrl);

  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Mapa</p>
          <h2 className="text-2xl font-semibold text-white">Localização</h2>
        </div>
        <Link
          to={`/eventos/${eventoId}/mapa`}
          className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
        >
          Ver no mapa
        </Link>
      </div>

      {temMapa ? (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-slate-950/90">
            {/* Mapa só de prévia: sem interação, o clique leva à página */}
            <iframe
              title="Prévia do mapa do evento"
              src={principal.embedUrl}
              className="pointer-events-none aspect-[4/3] w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <Link
              to={`/eventos/${eventoId}/mapa`}
              aria-label="Abrir mapa do evento"
              className="absolute inset-0"
            />
          </div>
          <p className="mt-3 text-sm text-slate-400">
            {principal.label || location}
          </p>
        </>
      ) : (
        <Link
          to={`/eventos/${eventoId}/mapa`}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 text-center text-slate-300 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:text-white"
        >
          <span className="text-fuchsia-400">{iconePin}</span>
          <span className="text-sm font-medium">Adicionar localização</span>
        </Link>
      )}
    </section>
  );
}
