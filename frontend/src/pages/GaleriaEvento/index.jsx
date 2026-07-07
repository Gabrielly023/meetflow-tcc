import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import Lightbox from "../../components/Lightbox";
import { buscarEventoPorId } from "../../services/eventoService";
import {
  listarFotos,
  adicionarFotos,
  removerParaMim,
  excluirParaTodos,
  isDonoFoto,
  reordenar,
  listarLixeira,
  restaurar,
} from "../../services/galeriaService";

export default function GaleriaEvento() {
  const { id } = useParams();
  const evento = buscarEventoPorId(id);
  const inputRef = useRef(null);
  const [fotos, setFotos] = useState(() => listarFotos(id));
  const [reordenando, setReordenando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(null);
  const [verLixeira, setVerLixeira] = useState(false);
  const [arrastandoIndice, setArrastandoIndice] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  function recarregar() {
    setFotos(listarFotos(id));
  }

  // Fecha o balão ao clicar fora dele
  useEffect(() => {
    if (!menuAberto) return;
    function aoClicarFora(evt) {
      if (!evt.target.closest(".galeria-menu")) setMenuAberto(null);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [menuAberto]);

  if (!evento) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-10">
          <div className="rounded-3xl border border-red-500/40 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/30">
            <h1 className="text-3xl font-semibold">Evento não encontrado</h1>
            <Link
              to="/eventos"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Voltar para eventos
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const lixeira = listarLixeira(id);

  async function handleArquivos(event) {
    const arquivos = event.target.files;
    if (!arquivos?.length) return;
    setCarregando(true);
    await adicionarFotos(id, arquivos);
    setCarregando(false);
    event.target.value = "";
    recarregar();
  }

  function handleRemoverParaMim(foto) {
    removerParaMim(foto.id);
    setMenuAberto(null);
    recarregar();
  }

  function handleExcluirParaTodos(foto) {
    setMenuAberto(null);
    const ok = window.confirm(
      "Excluir esta foto para todos os participantes? Ela vai para a lixeira e pode ser restaurada.",
    );
    if (!ok) return;
    excluirParaTodos(foto);
    recarregar();
  }

  function handleRestaurar(foto) {
    restaurar(foto);
    recarregar();
  }

  function handleDragStart(event, indice) {
    setArrastandoIndice(indice);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(indice));
  }

  function handleDragOver(event, indice) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (arrastandoIndice === null || arrastandoIndice === indice) return;
    // reordena ao vivo enquanto arrasta por cima
    const nova = [...fotos];
    const [item] = nova.splice(arrastandoIndice, 1);
    nova.splice(indice, 0, item);
    setArrastandoIndice(indice);
    setFotos(nova);
  }

  function handleDragEnd() {
    if (arrastandoIndice !== null) {
      reordenar(
        id,
        fotos.map((f) => f.id),
      );
    }
    setArrastandoIndice(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      {lightbox !== null && (
        <Lightbox
          fotos={fotos}
          indiceInicial={lightbox}
          onFechar={() => setLightbox(null)}
        />
      )}

      <div className="flex min-h-[calc(100vh-80px)]">
        <SideBar />
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Cabeçalho */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">
                  {verLixeira ? "Lixeira" : "Galeria"}
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  {evento.titulo}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {verLixeira
                    ? `${lixeira.length} na lixeira`
                    : `${fotos.length} ${fotos.length === 1 ? "foto" : "fotos"}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {!verLixeira ? (
                  <>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleArquivos}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={carregando}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {carregando ? "Enviando..." : "+ Adicionar fotos"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setReordenando((r) => !r)}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition duration-300 hover:scale-105 active:scale-95 ${
                        reordenando
                          ? "border-sky-500 bg-sky-500/10 text-sky-300"
                          : "border-slate-700 text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {reordenando ? "Concluir" : "Reordenar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReordenando(false);
                        setMenuAberto(null);
                        setVerLixeira(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition duration-300 hover:scale-105 hover:bg-slate-800 active:scale-95"
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
                    className="group inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition duration-300 hover:scale-105 hover:bg-slate-800 active:scale-95"
                  >
                    <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                      ←
                    </span>
                    Voltar à galeria
                  </button>
                )}

                <Link
                  to={`/eventos/${evento.id}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition duration-300 hover:scale-105 hover:bg-slate-800 active:scale-95"
                >
                  Voltar ao evento
                </Link>
              </div>
            </div>

            {/* ================= LIXEIRA ================= */}
            {verLixeira ? (
              lixeira.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-16 text-center text-slate-300">
                  A lixeira está vazia.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  {lixeira.map((foto) => (
                    <div
                      key={foto.id}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900 shadow-lg shadow-black/30"
                    >
                      <img
                        src={foto.url}
                        alt="Foto na lixeira"
                        className="h-full w-full object-cover opacity-60"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-medium text-slate-300 backdrop-blur">
                        {foto.motivo === "todos"
                          ? "Excluída para todos"
                          : "Removida para você"}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-2">
                        <button
                          type="button"
                          onClick={() => handleRestaurar(foto)}
                          className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90"
                        >
                          Restaurar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : /* ================= GALERIA ================= */
            fotos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-16 text-center">
                <p className="text-slate-300">Nenhuma foto ainda.</p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Adicionar a primeira foto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {fotos.map((foto, indice) => {
                  const dono = isDonoFoto(foto);
                  return (
                    <div
                      key={foto.id}
                      draggable={reordenando}
                      onDragStart={(e) => handleDragStart(e, indice)}
                      onDragOver={(e) => handleDragOver(e, indice)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => e.preventDefault()}
                      className={`group relative aspect-square rounded-2xl transition ${
                        menuAberto === foto.id ? "z-30" : ""
                      } ${reordenando ? "cursor-move" : ""} ${
                        arrastandoIndice === indice
                          ? "scale-95 opacity-40 ring-2 ring-fuchsia-500"
                          : ""
                      }`}
                    >
                      <div
                        onClick={() => !reordenando && setLightbox(indice)}
                        className={`absolute inset-0 overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900 shadow-lg shadow-black/30 ${
                          reordenando ? "" : "cursor-pointer"
                        }`}
                      >
                        <img
                          src={foto.url}
                          alt="Foto do evento"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>

                      {dono && (
                        <span className="absolute left-2 top-2 rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-fuchsia-300 backdrop-blur">
                          Sua
                        </span>
                      )}

                      {!reordenando && (
                        <div
                          className={`galeria-menu absolute right-2 top-2 transition ${
                            menuAberto === foto.id
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setMenuAberto(
                                menuAberto === foto.id ? null : foto.id,
                              )
                            }
                            title="Excluir foto"
                            className="rounded-full bg-slate-950/70 p-2 text-white backdrop-blur transition hover:bg-slate-950"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>

                          {menuAberto === foto.id && (
                            <div className="absolute right-0 top-11 z-20 w-60 rounded-2xl border border-slate-700/70 bg-slate-900/95 p-2 text-left shadow-2xl shadow-black/50 backdrop-blur">
                              <div className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 rounded-sm border-l border-t border-slate-700/70 bg-slate-900/95" />

                              <p className="px-2 py-1.5 text-[11px] leading-snug text-slate-400">
                                {dono
                                  ? "Você enviou esta foto. Pode removê-la só para você ou excluí-la para todos."
                                  : "Você pode remover esta foto só da sua galeria — ela continua para os outros participantes."}
                              </p>

                              <button
                                type="button"
                                onClick={() => handleRemoverParaMim(foto)}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                                Remover só para mim
                              </button>

                              {dono && (
                                <button
                                  type="button"
                                  onClick={() => handleExcluirParaTodos(foto)}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                  Excluir para todos
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {reordenando && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/30">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                              <path d="M9 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM18 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            </svg>
                            {indice + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
