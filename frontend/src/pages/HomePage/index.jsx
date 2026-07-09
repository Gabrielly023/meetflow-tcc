import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarEventos } from "../../services/eventoService";
import { listarFotos } from "../../services/galeriaService";
import {
  getPlaylistEmbed,
  getCapaPlaylist,
} from "../../services/playlistService";
import { getLocalPrincipal, listarLocais } from "../../services/mapaService";
import { contarNaoLidas } from "../../services/chatService";

export default function HomePage() {
  const eventos = listarEventos();
  const previews = eventos.flatMap((ev) => listarFotos(ev.id)).slice(0, 4);
  const capas = eventos
    .map((ev) => ev.capa || ev.images?.[0])
    .filter(Boolean)
    .slice(0, 4);
  // Miniaturas de playlist para o card: eventos que têm playlist
  const eventosComPlaylist = eventos.filter((ev) => getPlaylistEmbed(ev.id));
  const tilesPlaylist = eventosComPlaylist.slice(0, 4);
  const totalPlaylists = eventosComPlaylist.length;
  const chaveCapas = tilesPlaylist.map((ev) => ev.id).join(",");
  const [capasPlaylist, setCapasPlaylist] = useState({});

  // Busca as capas dos álbuns/playlists no Spotify (oEmbed) para os tiles
  useEffect(() => {
    const ids = chaveCapas ? chaveCapas.split(",") : [];
    if (ids.length === 0) return;
    let ativo = true;
    Promise.all(
      ids.map((id) => getCapaPlaylist(id).then((capa) => [id, capa])),
    ).then((pares) => {
      if (ativo) {
        setCapasPlaylist(Object.fromEntries(pares.filter(([, c]) => c)));
      }
    });
    return () => {
      ativo = false;
    };
  }, [chaveCapas]);

  const proximo = eventos[0];
  const capaProximo = proximo?.capa || proximo?.images?.[0];

  // Mapas: eventos com um local marcado (para as miniaturas) e total de locais
  const eventosComLocal = eventos.filter((ev) => getLocalPrincipal(ev.id));
  const tilesMapa = eventosComLocal
    .map((ev) => ev.capa || ev.images?.[0])
    .filter(Boolean)
    .slice(0, 4);
  const totalLocais = eventos.reduce(
    (soma, ev) => soma + listarLocais(ev.id).length,
    0,
  );
  // Chats: total de mensagens não lidas em todos os eventos
  const totalNaoLidasChat = eventos.reduce(
    (soma, ev) => soma + contarNaoLidas(ev.id),
    0,
  );

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 text-left lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p
                  className="text-2xl font-semibold"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right,#fb923c 0%,#ec4899 25%,#f472b6 30%,#a855f7 60%,#60a5fa 70%,#38bdf8 85%,#22c55e 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Seja bem-vindo
                </p>
                <p className="mt-1 text-5xl font-semibold text-white">
                  Seu espaço
                </p>
                <p className="mt-2 text-slate-400">
                  Acesse rapidamente o que importa.
                </p>
              </div>

              {proximo && (
                <Link
                  to={`/eventos/${proximo.id}`}
                  className="hover-degrade group flex items-center gap-4 rounded-3xl border-2 border-slate-800/70 bg-slate-900/70 p-4 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 lg:w-80"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                    {capaProximo ? (
                      <img
                        src={capaProximo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500/30 via-fuchsia-500/30 to-sky-500/30 text-[9px] uppercase tracking-wide text-white/80">
                        {proximo.tipo}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-fuchsia-400">
                      Próximo evento
                    </p>
                    <h2 className="truncate text-lg font-semibold text-white">
                      {proximo.titulo}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-slate-400">
                      {proximo.data}
                      {proximo.local ? ` · ${proximo.local}` : ""}
                    </p>
                  </div>
                  <span className="text-fuchsia-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              )}
            </div>

            {/* Bloco menor: Criar evento */}
            <Link
              to="/eventos/novo"
              className="group mt-8 flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-sky-500 to-violet-600 p-5 text-left shadow-lg shadow-violet-500/25 transition duration-300 hover:scale-[1.01] hover:opacity-95 active:scale-100"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Criar novo evento
                  </h2>
                  <p className="text-sm text-white/80">
                    Comece um evento do zero em poucos cliques.
                  </p>
                </div>
              </div>
              <span className="text-white transition group-hover:translate-x-1">
                →
              </span>
            </Link>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* Bloco: Meus eventos */}
              <Link
                to="/eventos"
                className="group rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 8.25h18M4.5 4.5h15A1.5 1.5 0 0121 6v13.5A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V6a1.5 1.5 0 011.5-1.5z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Meus eventos
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Crie, veja e gerencie todos os meus eventos.
                    </p>
                  </div>
                  <span className="text-fuchsia-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                {capas.length > 0 && (
                  <div className="mt-5 flex gap-2">
                    {capas.map((url, i) => (
                      <div
                        key={i}
                        className="h-16 w-16 overflow-hidden rounded-xl border border-slate-800/60"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    <div className="flex h-16 items-center rounded-xl px-3 text-sm text-slate-400">
                      {eventos.length}{" "}
                      {eventos.length === 1 ? "evento" : "eventos"}
                    </div>
                  </div>
                )}
              </Link>

              {/* Bloco: Minhas galerias */}
              <Link
                to="/galerias"
                className="group rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Minhas galerias
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Todas as fotos dos meus eventos, lado a lado, num só lugar.
                    </p>
                  </div>
                  <span className="text-fuchsia-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                {previews.length > 0 && (
                  <div className="mt-5 flex gap-2">
                    {previews.map((foto) => (
                      <div
                        key={foto.id}
                        className="h-16 w-16 overflow-hidden rounded-xl border border-slate-800/60"
                      >
                        <img
                          src={foto.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="flex h-16 items-center rounded-xl px-3 text-sm text-slate-400">
                      {eventos.length}{" "}
                      {eventos.length === 1 ? "galeria" : "galerias"}
                    </div>
                  </div>
                )}
              </Link>

              {/* Bloco: Minhas playlists */}
              <Link
                to="/playlists"
                className="group rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Minhas playlists
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      A trilha sonora de cada evento, com músicas sugeridas por
                      todo mundo.
                    </p>
                  </div>
                  <span className="text-fuchsia-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                {tilesPlaylist.length > 0 && (
                  <div className="mt-5 flex gap-2">
                    {tilesPlaylist.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-800/60 bg-gradient-to-br from-orange-500/25 via-fuchsia-500/25 to-sky-500/25"
                      >
                        {capasPlaylist[ev.id] ? (
                          <img
                            src={capasPlaylist[ev.id]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-7 w-7 text-white/80">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                          </svg>
                        )}
                      </div>
                    ))}
                    <div className="flex h-16 items-center rounded-xl px-3 text-sm text-slate-400">
                      {totalPlaylists}{" "}
                      {totalPlaylists === 1 ? "playlist" : "playlists"}
                    </div>
                  </div>
                )}
              </Link>

              {/* Bloco: Meus mapas */}
              <Link
                to="/mapas"
                className="group rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Meus mapas
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      A localização de cada evento no mapa, tudo reunido num só
                      lugar.
                    </p>
                  </div>
                  <span className="text-fuchsia-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                {tilesMapa.length > 0 && (
                  <div className="mt-5 flex gap-2">
                    {tilesMapa.map((url, i) => (
                      <div
                        key={i}
                        className="h-16 w-16 overflow-hidden rounded-xl border border-slate-800/60"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    <div className="flex h-16 items-center rounded-xl px-3 text-sm text-slate-400">
                      {totalLocais} {totalLocais === 1 ? "local" : "locais"}
                    </div>
                  </div>
                )}
              </Link>

              {/* Bloco: Meus chats */}
              <Link
                to="/chats"
                className="group rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Meus chats
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      As conversas de todos os meus eventos, reunidas num só
                      lugar.
                    </p>
                  </div>
                  <span className="text-fuchsia-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                {capas.length > 0 && (
                  <div className="mt-5 flex gap-2">
                    {capas.map((url, i) => (
                      <div
                        key={i}
                        className="h-16 w-16 overflow-hidden rounded-xl border border-slate-800/60"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    <div className="flex h-16 items-center rounded-xl px-3 text-sm text-slate-400">
                      {totalNaoLidasChat > 0
                        ? `${totalNaoLidasChat} não lidas`
                        : `${eventos.length} ${eventos.length === 1 ? "conversa" : "conversas"}`}
                    </div>
                  </div>
                )}
              </Link>
            </div>
          </div>
    </main>
  );
}
