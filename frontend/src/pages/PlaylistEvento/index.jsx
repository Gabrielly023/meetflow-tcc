import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { buscarEventoPorId } from "../../services/eventoService";
import {
  getPlaylistEmbed,
  embedParaSpotify,
  embedParaUri,
  definirPlaylist,
  removerPlaylist,
  listarMusicas,
  adicionarMusica,
  removerMusica,
  isDonoMusica,
  curtirMusica,
  usuarioVotou,
} from "../../services/playlistService";
import { usePlayer } from "../../context/PlayerContext";
import TituloDegrade from "../../components/TituloDegrade";

export default function PlaylistEvento() {
  const { id } = useParams();
  const evento = buscarEventoPorId(id);
  const { tocar } = usePlayer();

  const [embed, setEmbed] = useState(() => getPlaylistEmbed(id));
  const [editando, setEditando] = useState(false);
  const [link, setLink] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState(false);

  // Lista de músicas colaborativa do evento
  const [musicas, setMusicas] = useState(() => listarMusicas(id));
  const [addMusica, setAddMusica] = useState(false);
  const [linkMusica, setLinkMusica] = useState("");
  const [erroMusica, setErroMusica] = useState("");

  if (!evento) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="rounded-3xl border border-red-500/40 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/30">
            <h1 className="text-3xl font-semibold">Evento não encontrado</h1>
            <p className="mt-4 text-slate-300">Verifique se o link está correto ou volte para a página de eventos.</p>
            <Link to="/eventos" className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
              Voltar para eventos
            </Link>
          </div>
      </main>
    );
  }

  const playlist = evento.playlist || {};

  function abrirFormulario() {
    setLink("");
    setErro("");
    setEditando(true);
  }

  function salvar(e) {
    e.preventDefault();
    const novo = definirPlaylist(id, link);
    if (!novo) {
      setErro("Não reconhecemos esse link. Copie o link da playlist no Spotify (Compartilhar → Copiar link).");
      return;
    }
    setEmbed(novo);
    setEditando(false);
    setLink("");
    setErro("");
  }

  function remover() {
    removerPlaylist(id);
    setEmbed(getPlaylistEmbed(id));
    setEditando(false);
  }

  function abrirAddMusica() {
    setLinkMusica("");
    setErroMusica("");
    setAddMusica(true);
  }

  function salvarMusica(e) {
    e.preventDefault();
    const resultado = adicionarMusica(id, linkMusica);
    if (resultado.erro === "duplicada") {
      setErroMusica("Essa música já está na lista do evento.");
      return;
    }
    if (resultado.erro) {
      setErroMusica("Não reconhecemos esse link. Copie o link de uma música no Spotify (Compartilhar → Copiar link).");
      return;
    }
    setMusicas(listarMusicas(id));
    setLinkMusica("");
    setErroMusica("");
    setAddMusica(false);
  }

  function removerMusicaHandler(musicaId) {
    removerMusica(id, musicaId);
    setMusicas(listarMusicas(id));
  }

  function curtir(musicaId) {
    curtirMusica(id, musicaId);
    setMusicas(listarMusicas(id));
  }

  // Contador: total de músicas e quantas pessoas diferentes sugeriram
  const totalMusicas = musicas.length;
  const totalSugestores = new Set(musicas.map((m) => m.ownerId)).size;

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-5xl space-y-8">
            {/* Cabeçalho da página */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em]">
                  <span className="texto-gradiente-2">Playlist</span>
                  <span className="text-white"> do evento</span>
                </p>
                <h1 className="text-4xl font-semibold text-white"><TituloDegrade texto={evento.titulo} /></h1>
                <p className="mt-2 text-sm text-slate-400">{evento.data} · {evento.local}</p>
              </div>
              <Link
                to={`/eventos/${evento.id}`}
                className="group inline-flex items-center justify-center gap-1 self-start rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
              >
                <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                Voltar ao evento
              </Link>
            </div>

            {/* Player / gerenciamento da playlist */}
            <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">{playlist.name || "Playlist do evento"}</p>
                  {playlist.description && (
                    <p className="mt-1 text-sm text-slate-400">{playlist.description}</p>
                  )}
                </div>
                {embed ? (
                  <a
                    href={embedParaSpotify(embed)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir esta playlist no Spotify"
                    className="rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90 hover:scale-105"
                  >
                    Ir para o Spotify
                  </a>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAviso(true)}
                      onMouseEnter={() => setAviso(true)}
                      onMouseLeave={() => setAviso(false)}
                      className="rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90"
                    >
                      Ir para o Spotify
                    </button>
                    {aviso && (
                      <div className="absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-white shadow-lg ring-1 ring-slate-700">
                        Adicione sua playlist primeiro
                        <span className="absolute -top-1 right-6 h-2 w-2 rotate-45 bg-slate-800" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Formulário de adicionar/trocar playlist */}
              {editando && (
                <form onSubmit={salvar} className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
                  <label className="block text-sm font-medium text-white">
                    Link da playlist do Spotify
                  </label>
                  <p className="mt-1 text-xs text-slate-400">
                    No Spotify, abra a playlist → botão <span className="text-slate-200">Compartilhar</span> → <span className="text-slate-200">Copiar link</span>, e cole aqui.
                  </p>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://open.spotify.com/playlist/..."
                    autoFocus
                    className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none"
                  />
                  {erro && <p className="mt-2 text-sm text-red-400">{erro}</p>}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                    >
                      Salvar playlist
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditando(false)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {embed ? (
                <>
                  <div className="relative overflow-hidden rounded-3xl bg-slate-950/90">
                    <iframe
                      title={playlist.name || "Playlist do evento"}
                      src={embed}
                      width="100%"
                      height="600"
                      frameBorder="0"
                      loading="lazy"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      style={{ borderRadius: "12px", display: "block" }}
                    />
                    {/* Película redonda e invisível, só sobre o botão de play do Spotify */}
                    <button
                      type="button"
                      onClick={() => tocar(embedParaUri(embed), evento.titulo)}
                      title="Tocar na barra do site"
                      aria-label="Tocar na barra do site"
                      className="absolute right-5 top-16 h-14 w-14 cursor-pointer rounded-full"
                    />
                  </div>
                  {!editando && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => tocar(embedParaUri(embed), evento.titulo)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Tocar aqui
                      </button>
                      <button
                        type="button"
                        onClick={abrirFormulario}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                      >
                        Trocar playlist
                      </button>
                      <button
                        type="button"
                        onClick={remover}
                        className="inline-flex items-center justify-center rounded-2xl border border-red-500/40 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                      >
                        Remover playlist
                      </button>
                    </div>
                  )}
                </>
              ) : (
                !editando && (
                  <div className="rounded-3xl bg-slate-950/90 p-8 text-center text-slate-300">
                    <p className="text-base font-medium text-white">Este evento ainda não tem uma playlist.</p>
                    <p className="mt-2 text-sm text-slate-400">Adicione uma playlist do Spotify para animar o evento — é só colar o link.</p>
                    <button
                      type="button"
                      onClick={abrirFormulario}
                      className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                    >
                      Adicionar playlist
                    </button>
                  </div>
                )
              )}
            </section>

            {/* Músicas do evento (lista colaborativa) */}
            <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Colaborativo</p>
                  <h2 className="text-2xl font-semibold text-white">Músicas do evento</h2>
                  {totalMusicas > 0 ? (
                    <p className="mt-1 text-sm text-slate-400">
                      {totalMusicas} {totalMusicas === 1 ? "música" : "músicas"} · sugerida{totalMusicas === 1 ? "" : "s"} por {totalSugestores} {totalSugestores === 1 ? "pessoa" : "pessoas"}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">Qualquer participante pode sugerir músicas — é só colar o link.</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={abrirAddMusica}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                >
                  <span className="text-lg leading-none">+</span>
                  Adicionar música
                </button>
              </div>

              {/* Formulário de adicionar música */}
              {addMusica && (
                <form onSubmit={salvarMusica} className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
                  <label className="block text-sm font-medium text-white">
                    Link da música no Spotify
                  </label>
                  <p className="mt-1 text-xs text-slate-400">
                    No Spotify, na música → <span className="text-slate-200">···</span> (ou botão direito) → <span className="text-slate-200">Compartilhar</span> → <span className="text-slate-200">Copiar link</span>.
                  </p>
                  <input
                    type="text"
                    value={linkMusica}
                    onChange={(e) => setLinkMusica(e.target.value)}
                    placeholder="https://open.spotify.com/track/..."
                    autoFocus
                    className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none"
                  />
                  {erroMusica && <p className="mt-2 text-sm text-red-400">{erroMusica}</p>}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                    >
                      Adicionar à lista
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMusica(false)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de músicas */}
              {musicas.length > 0 ? (
                <div className="space-y-4">
                  {musicas.map((musica) => (
                    <div key={musica.id} className="rounded-2xl bg-slate-950/90 p-3">
                      <div className="relative overflow-hidden rounded-xl">
                        <iframe
                          title={`Música ${musica.id}`}
                          src={musica.embed}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          loading="lazy"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          style={{ borderRadius: "12px", display: "block" }}
                        />
                        {/* Película redonda e invisível, só sobre o botão de play do Spotify */}
                        <button
                          type="button"
                          onClick={() => tocar(embedParaUri(musica.embed), evento.titulo)}
                          title="Tocar na barra do site"
                          aria-label="Tocar na barra do site"
                          className="absolute right-4 top-1/2 h-11 w-11 -translate-y-1/2 cursor-pointer rounded-full"
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 px-1">
                        <div className="flex items-center gap-2">
                        {/* Botão de curtir + contagem de votos */}
                        <button
                          type="button"
                          onClick={() => curtir(musica.id)}
                          title={usuarioVotou(musica) ? "Remover meu voto" : "Curtir esta música"}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition duration-300 hover:scale-105 active:scale-95 ${
                            usuarioVotou(musica)
                              ? "bg-fuchsia-500/20 text-fuchsia-300 ring-1 ring-fuchsia-500/40"
                              : "bg-slate-800 text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={usuarioVotou(musica) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4 w-4"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                          {musica.votos.length}
                        </button>

                        {/* Tocar esta música no player fixo */}
                        <button
                          type="button"
                          onClick={() => tocar(embedParaUri(musica.embed), evento.titulo)}
                          title="Tocar no player"
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-sm font-medium text-fuchsia-300 ring-1 ring-slate-700 transition duration-300 hover:scale-105 hover:bg-fuchsia-500/10 active:scale-95"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Tocar
                        </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            Adicionada por {isDonoMusica(musica) ? "você" : "um participante"}
                          </span>
                          {isDonoMusica(musica) && (
                            <button
                              type="button"
                              onClick={() => removerMusicaHandler(musica.id)}
                              title="Remover minha música"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-slate-400 ring-1 ring-slate-700 transition hover:bg-red-500/90 hover:text-white"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !addMusica && (
                  <div className="rounded-3xl bg-slate-950/90 p-8 text-center text-slate-300">
                    <p className="text-base font-medium text-white">Nenhuma música sugerida ainda.</p>
                    <p className="mt-2 text-sm text-slate-400">Seja o primeiro a adicionar uma música ao evento!</p>
                  </div>
                )
              )}
            </section>
          </div>
    </main>
  );
}
