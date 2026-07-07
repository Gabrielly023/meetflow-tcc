import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import Lightbox from "../../components/Lightbox";
import { listarEventos } from "../../services/eventoService";
import {
  listarFotos,
  curtirFoto,
  getVotosFoto,
  usuarioCurtiuFoto,
} from "../../services/galeriaService";

export default function MinhasGalerias() {
  const eventos = listarEventos();
  const todasFotos = eventos.flatMap((ev) =>
    listarFotos(ev.id).map((foto) => ({
      ...foto,
      eventoId: ev.id,
      eventoTitulo: ev.titulo,
    })),
  );
  const [lightbox, setLightbox] = useState(null);
  const [, forcarAtualizacao] = useState(0);

  function handleCurtir(fotoId) {
    curtirFoto(fotoId);
    forcarAtualizacao((n) => n + 1);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      {lightbox !== null && (
        <Lightbox
          fotos={todasFotos}
          indiceInicial={lightbox}
          onFechar={() => setLightbox(null)}
        />
      )}

      <div className="flex min-h-[calc(100vh-80px)]">
        <SideBar />
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">
                  Galerias
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  Minhas galerias
                </h1>
                <p className="mt-2 text-slate-400">
                  Todas as galerias dos seus eventos, lado a lado. Clique em uma
                  para ver e gerenciar as fotos.
                </p>
              </div>
              <span className="text-sm text-slate-400">
                {eventos.length} {eventos.length === 1 ? "galeria" : "galerias"}
              </span>
            </div>

            {eventos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-16 text-center text-slate-300">
                Você ainda não tem eventos.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {eventos.map((evento) => {
                  const fotos = listarFotos(evento.id);
                  return (
                    <Link
                      key={evento.id}
                      to={`/eventos/${evento.id}/galeria`}
                      className="group overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
                    >
                      {/* Colagem 2x2 das fotos */}
                      <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-0.5 bg-slate-950">
                        {[0, 1, 2, 3].map((i) => {
                          const foto = fotos[i];
                          return foto ? (
                            <div key={i} className="overflow-hidden">
                              <img
                                src={foto.url}
                                alt=""
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            </div>
                          ) : (
                            <div
                              key={i}
                              className="flex items-center justify-center bg-slate-900 text-xs text-slate-600"
                            >
                              {i === 0 && fotos.length === 0 ? "Sem fotos" : ""}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between gap-3 p-5">
                        <div>
                          <h2 className="text-lg font-semibold text-white">
                            {evento.titulo}
                          </h2>
                          <p className="mt-1 text-sm text-slate-400">
                            {fotos.length}{" "}
                            {fotos.length === 1 ? "foto" : "fotos"}
                          </p>
                        </div>
                        <span className="text-fuchsia-400 transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Galeria geral: todas as fotos de todos os eventos juntas */}
            {todasFotos.length > 0 && (
              <div className="space-y-8 pt-10">
                {/* Divisor em degradê */}
                <div className="h-1 w-full rounded-full bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent" />

                <div className="text-center">
                  <p className="text-sm uppercase tracking-[0.35em] text-sky-400">
                    Galeria geral
                  </p>
                  <p className="mt-3 text-4xl font-semibold texto-gradiente sm:text-5xl">
                    Todas as suas memórias
                  </p>
                  <p className="mt-3 text-slate-400">
                    {todasFotos.length} fotos de todos os eventos, num só lugar.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {todasFotos.map((foto, i) => (
                    <div
                      key={foto.id}
                      onClick={() => setLightbox(i)}
                      className="hover-degrade group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-800/60 shadow-lg shadow-black/30 transition duration-300"
                    >
                      <img
                        src={foto.url}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {/* Curtir foto */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCurtir(foto.id);
                        }}
                        title={usuarioCurtiuFoto(foto.id) ? "Remover meu like" : "Curtir foto"}
                        className={`absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur transition duration-300 hover:scale-105 active:scale-95 ${
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

                      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-slate-950/80 px-3 py-2 text-xs font-medium text-white backdrop-blur transition duration-300 group-hover:translate-y-0">
                        {foto.eventoTitulo}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
