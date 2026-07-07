import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarEventos } from "../../services/eventoService";
import {
  getPlaylistEmbed,
  listarMusicas,
  getUltimaPlaylist,
  setUltimaPlaylist,
  embedParaUri,
} from "../../services/playlistService";
import { usePlayer } from "../../context/PlayerContext";

export default function MinhasPlaylists() {
  const eventos = listarEventos();

  // Junta os dados de playlist de cada evento (embed do Spotify + músicas sugeridas)
  const playlists = eventos.map((evento) => ({
    evento,
    embed: getPlaylistEmbed(evento.id),
    totalMusicas: listarMusicas(evento.id).length,
  }));

  const comPlaylist = playlists.filter((p) => p.embed).length;

  const { tocar } = usePlayer();

  // Última playlist ouvida: vem primeiro (destaque no topo).
  // Fixamos o valor no carregamento da página de propósito — reordenar enquanto
  // a música toca faria o iframe do Spotify recarregar e parar de tocar.
  const [ultimaId] = useState(() => getUltimaPlaylist());
  const ehUltima = (p) => p.embed && String(p.evento.id) === String(ultimaId);
  const ordenadas = [
    ...playlists.filter(ehUltima),
    ...playlists.filter((p) => !ehUltima(p)),
  ];

  // Marca como "ouvida por último" quando a pessoa interage com um player.
  // Clicar dentro de um iframe (Spotify) tira o foco da janela e coloca o
  // próprio iframe como elemento ativo — usamos isso para saber qual tocou.
  useEffect(() => {
    function aoSairDoFoco() {
      window.setTimeout(() => {
        const el = document.activeElement;
        if (el?.tagName === "IFRAME" && el.dataset.playlistEvento) {
          setUltimaPlaylist(el.dataset.playlistEvento);
        }
      }, 0);
    }
    window.addEventListener("blur", aoSairDoFoco);
    return () => window.removeEventListener("blur", aoSairDoFoco);
  }, []);

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="texto-gradiente-2 text-base font-semibold uppercase tracking-[0.3em]">
                  Playlists
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  Minhas <span className="texto-gradiente">playlists</span>
                </h1>
                <p className="mt-2 text-slate-400">
                  As trilhas sonoras de todos os seus eventos, lado a lado. Toque
                  aqui mesmo ou abra o evento para ouvir as músicas.
                </p>
              </div>

              {/* Bloquinho com o resumo (quantidade de playlists) — borda em degradê roxo→azul */}
              <div className="self-start rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 p-[1.5px] shadow-lg shadow-violet-500/25">
                <div className="rounded-2xl bg-slate-900 px-5 py-3 text-center">
                  <p className="texto-gradiente-2 text-2xl font-semibold">
                    {comPlaylist}
                  </p>
                  <p className="text-xs text-slate-400">
                    {comPlaylist === 1 ? "playlist" : "playlists"}
                  </p>
                </div>
              </div>
            </div>

            {eventos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-16 text-center text-slate-300">
                Você ainda não tem eventos.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ordenadas.map(({ evento, embed, totalMusicas }) => {
                  const destacada = ehUltima({ evento, embed });
                  return (
                  <div
                    key={evento.id}
                    className={`group flex flex-col overflow-hidden rounded-3xl border bg-slate-900/70 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20 ${
                      destacada
                        ? "border-fuchsia-500/60 ring-1 ring-fuchsia-500/40"
                        : "border-slate-800/70"
                    }`}
                  >
                    {/* Selo da última playlist ouvida */}
                    {destacada && (
                      <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 text-xs font-medium text-fuchsia-300">
                        <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                        Ouvida por último
                      </div>
                    )}

                    {/* Player real do Spotify (ou convite para adicionar) */}
                    {embed ? (
                      <div className="relative">
                        <iframe
                          title={`Playlist de ${evento.titulo}`}
                          src={embed}
                          data-playlist-evento={evento.id}
                          width="100%"
                          height="352"
                          frameBorder="0"
                          loading="lazy"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          style={{ display: "block", borderRadius: "12px" }}
                        />
                        {/* Película redonda e invisível, só sobre o botão de play do Spotify */}
                        <button
                          type="button"
                          onClick={() => {
                            setUltimaPlaylist(evento.id);
                            tocar(embedParaUri(embed), evento.titulo);
                          }}
                          title="Tocar na barra do site"
                          aria-label="Tocar na barra do site"
                          className="absolute right-5 top-16 h-14 w-14 cursor-pointer rounded-full"
                        />
                      </div>
                    ) : (
                      <Link
                        to={`/eventos/${evento.id}/playlist`}
                        className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-gradient-to-br from-orange-500/25 via-fuchsia-500/25 to-sky-500/25 text-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.4"
                          stroke="currentColor"
                          className="h-16 w-16 text-white/70 transition duration-500 group-hover:scale-110"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-white">
                          Adicionar playlist
                        </span>
                      </Link>
                    )}

                    {/* Botão que manda a playlist para o player fixo (continua ao navegar) */}
                    {embed && (
                      <button
                        type="button"
                        onClick={() => tocar(embedParaUri(embed), evento.titulo)}
                        className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-2xl border border-violet-500/40 px-5 py-2.5 text-sm font-semibold text-slate-200 transition duration-300 hover:scale-[1.03] hover:border-transparent hover:bg-gradient-to-r hover:from-violet-500 hover:to-sky-500 hover:text-white hover:shadow-lg hover:shadow-violet-500/25 active:scale-95"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Tocar aqui
                      </button>
                    )}

                    {/* Rodapé: leva para a página completa da playlist do evento */}
                    <Link
                      to={`/eventos/${evento.id}/playlist`}
                      className="flex items-center justify-between gap-3 p-5 transition hover:bg-slate-900/60"
                    >
                      <div className="min-w-0">
                        <h2 className="truncate texto-gradiente-2 text-lg font-semibold">
                          {evento.titulo}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                          {totalMusicas}{" "}
                          {totalMusicas === 1
                            ? "música sugerida"
                            : "músicas sugeridas"}
                        </p>
                      </div>
                      <span className="text-fuchsia-400 transition group-hover:translate-x-1">
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
