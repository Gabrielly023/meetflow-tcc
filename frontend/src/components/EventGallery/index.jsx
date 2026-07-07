import { useState } from "react";
import { Link } from "react-router-dom";
import {
  listarFotos,
  curtirFoto,
  getVotosFoto,
  usuarioCurtiuFoto,
} from "../../services/galeriaService";

export default function EventGallery({ eventoId }) {
  const [fotos, setFotos] = useState(() => listarFotos(eventoId).slice(0, 4));

  function handleCurtir(fotoId) {
    curtirFoto(fotoId);
    setFotos(listarFotos(eventoId).slice(0, 4));
  }

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
            <div
              key={foto.id}
              className="group relative overflow-hidden rounded-3xl bg-slate-950/80 shadow-inner shadow-black/20"
            >
              <Link to={`/eventos/${eventoId}/galeria`} className="block">
                <img
                  src={foto.url}
                  alt="Foto do evento"
                  className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </Link>

              <button
                type="button"
                onClick={() => handleCurtir(foto.id)}
                title={usuarioCurtiuFoto(foto.id) ? "Remover meu like" : "Curtir foto"}
                className={`absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur transition duration-300 hover:scale-105 active:scale-95 ${
                  usuarioCurtiuFoto(foto.id)
                    ? "bg-fuchsia-500/30 text-fuchsia-200 ring-1 ring-fuchsia-400/50"
                    : "bg-slate-950/70 text-slate-200 ring-1 ring-slate-700"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={usuarioCurtiuFoto(foto.id) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-3.5 w-3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {getVotosFoto(foto.id)}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
