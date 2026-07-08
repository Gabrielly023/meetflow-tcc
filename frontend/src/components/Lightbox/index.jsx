import { useEffect, useState } from "react";
import {
  curtirFoto,
  getVotosFoto,
  usuarioCurtiuFoto,
} from "../../services/galeriaService";

// Visualizador de fotos em tela cheia, com navegação horizontal (← →).
export default function Lightbox({ fotos, indiceInicial = 0, onFechar }) {
  const [indice, setIndice] = useState(indiceInicial);
  const [, forcarAtualizacao] = useState(0);

  useEffect(() => {
    function aoTeclar(evt) {
      if (evt.key === "Escape") onFechar?.();
      else if (evt.key === "ArrowLeft")
        setIndice((i) => (i - 1 + fotos.length) % fotos.length);
      else if (evt.key === "ArrowRight")
        setIndice((i) => (i + 1) % fotos.length);
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [fotos.length, onFechar]);

  if (!fotos?.length) return null;
  const foto = fotos[indice];

  const anterior = (e) => {
    e?.stopPropagation();
    setIndice((i) => (i - 1 + fotos.length) % fotos.length);
  };
  const proxima = (e) => {
    e?.stopPropagation();
    setIndice((i) => (i + 1) % fotos.length);
  };

  const handleCurtir = (e) => {
    e.stopPropagation();
    curtirFoto(foto.id);
    forcarAtualizacao((n) => n + 1);
  };

  return (
    <div
      className="lightbox-fade fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur"
      onClick={onFechar}
    >
      {/* Contador */}
      <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-slate-900/70 px-4 py-1.5 text-sm font-medium text-slate-200 backdrop-blur">
        {indice + 1} / {fotos.length}
      </div>

      {/* Fechar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onFechar?.();
        }}
        aria-label="Fechar"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur transition hover:bg-slate-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Anterior */}
      {fotos.length > 1 && (
        <button
          type="button"
          onClick={anterior}
          aria-label="Anterior"
          className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur transition hover:scale-110 hover:bg-slate-800 sm:left-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {/* Imagem */}
      <img
        key={foto.id}
        src={foto.url}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="lightbox-img max-h-[85vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl shadow-black/50"
      />

      {/* Curtir a foto atual */}
      <button
        type="button"
        onClick={handleCurtir}
        title={usuarioCurtiuFoto(foto.id) ? "Remover meu like" : "Curtir foto"}
        className={`absolute bottom-6 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur transition duration-300 hover:scale-105 active:scale-95 ${
          usuarioCurtiuFoto(foto.id)
            ? "bg-fuchsia-500/30 text-fuchsia-200 ring-1 ring-fuchsia-400/50"
            : "bg-slate-900/70 text-slate-200 ring-1 ring-slate-700"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={usuarioCurtiuFoto(foto.id) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        {getVotosFoto(foto.id)}
      </button>

      {/* Próxima */}
      {fotos.length > 1 && (
        <button
          type="button"
          onClick={proxima}
          aria-label="Próxima"
          className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur transition hover:scale-110 hover:bg-slate-800 sm:right-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  );
}
