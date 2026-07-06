import { Link } from "react-router-dom";
import { listarFotos } from "../../services/galeriaService";

export default function EventGallery({ eventoId }) {
  const fotos = listarFotos(eventoId).slice(0, 4);

  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Galeria</p>
          <h2 className="text-2xl font-semibold text-white">Fotos do evento</h2>
        </div>
        <Link
          to={`/eventos/${eventoId}/galeria`}
          className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
        >
          Ver todas
        </Link>
      </div>

      {fotos.length === 0 ? (
        <Link
          to={`/eventos/${eventoId}/galeria`}
          className="flex h-44 items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 text-sm text-slate-400 transition hover:border-fuchsia-500/50 hover:text-slate-200"
        >
          Nenhuma foto ainda — clique para adicionar
        </Link>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {fotos.map((foto) => (
            <Link
              key={foto.id}
              to={`/eventos/${eventoId}/galeria`}
              className="group overflow-hidden rounded-3xl bg-slate-950/80 shadow-inner shadow-black/20"
            >
              <img
                src={foto.url}
                alt="Foto do evento"
                className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
