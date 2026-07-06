import { useEffect, useState } from "react";

// Visualizador de fotos em tela cheia, com navegação horizontal (← →).
export default function Lightbox({ fotos, indiceInicial = 0, onFechar }) {
  const [indice, setIndice] = useState(indiceInicial);

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
