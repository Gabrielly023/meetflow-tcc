import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listarEventos,
  listarLixeiraEventos,
} from "../../services/eventoService";
import EventCover from "../../components/EventCover";
import {
  carregarPlaylist,
  getCapaPlaylist,
} from "../../services/playlistService";
import { getLocalPrincipal, listarLocais } from "../../services/mapaService";
import { contarNaoLidas } from "../../services/chatService";
import { listarLixeira } from "../../services/galeriaService";

export default function HomePage() {
  const [eventos, setEventos] = useState([]);
  const [eventosExcluidosHome, setEventosExcluidosHome] = useState([]);
  const [playlistsHome, setPlaylistsHome] = useState([]);
  const [fotosExcluidasHome, setFotosExcluidasHome] = useState([]);

useEffect(() => {
  listarEventos()
    .then((dados) => {
      setEventos(dados);
    })
    .catch((erro) => {
      console.error("Erro ao carregar eventos:", erro);
      setEventos([]);
    });
}, []);

useEffect(() => {
  let ativo = true;

  Promise.resolve()
    .then(() => listarLixeiraEventos())
    .then((dados) => {
      if (ativo) setEventosExcluidosHome(Array.isArray(dados) ? dados : []);
    })
    .catch((erro) => {
      console.error("Não foi possível carregar os eventos da lixeira:", erro);
    });

  return () => {
    ativo = false;
  };
}, []);

useEffect(() => {
  let ativo = true;

  async function carregarFotosExcluidas() {
    const resultados = await Promise.allSettled(
      eventos.map((evento) => listarLixeira(evento.id)),
    );
    const fotos = resultados.flatMap((resultado, indice) => {
      if (resultado.status === "fulfilled") {
        return (Array.isArray(resultado.value) ? resultado.value : [])
          .filter((foto) => foto?.url)
          .map((foto) => ({ ...foto, eventoId: eventos[indice].id }));
      }

      console.error(
        `Não foi possível carregar a lixeira da galeria do evento ${eventos[indice].id}:`,
        resultado.reason,
      );
      return [];
    });

    if (ativo) setFotosExcluidasHome(fotos);
  }

  if (eventos.length > 0) {
    carregarFotosExcluidas();
  }

  return () => {
    ativo = false;
  };
}, [eventos]);

const capas = eventos
  .map((ev) => ev.capa || ev.images?.[0])
  .filter(Boolean)
  .slice(0, 4);
const eventosPreviewGalerias = eventos.slice(0, 4);

  useEffect(() => {
    let ativo = true;

    async function carregarPlaylistsHome() {
      const resultados = await Promise.allSettled(
        eventos.map(async (evento) => {
          const embed = await carregarPlaylist(evento.id);
          if (!embed) return null;

          const capa = await getCapaPlaylist(evento.id, embed);
          return { evento, capa };
        }),
      );

      const playlists = resultados.flatMap((resultado, indice) => {
        if (resultado.status === "fulfilled") {
          return resultado.value ? [resultado.value] : [];
        }

        console.error(
          `Não foi possível carregar a playlist do evento ${eventos[indice].id}:`,
          resultado.reason,
        );
        return [];
      });

      if (ativo) setPlaylistsHome(playlists);
    }

    carregarPlaylistsHome();

    return () => {
      ativo = false;
    };
  }, [eventos]);

  const tilesPlaylist = playlistsHome.slice(0, 4);
  const totalPlaylists = playlistsHome.length;

  const [agora] = useState(() => Date.now());
  const eventosFuturos = eventos
    .filter((ev) => {
      const timestamp = ev.dataHora ? new Date(ev.dataHora).getTime() : NaN;
      return Number.isFinite(timestamp) && timestamp > agora;
    })
    .sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
    );
  const proximo = eventosFuturos[0];
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
    <main className="home-page flex-1 px-6 py-8 lg:px-10">
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
                <p className="home-page-title mt-1 text-5xl font-semibold text-white">
                  Seu espaço
                </p>
                <p className="home-page-description mt-2 text-slate-400">
                  Acesse rapidamente o que importa.
                </p>
              </div>

              {proximo ? (
                <Link
                  to={`/eventos/${proximo.id}`}
                  className="home-next-event hover-degrade group flex items-center gap-4 rounded-3xl border-2 border-slate-800/70 bg-slate-900/70 p-4 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 lg:w-80"
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
                  <div className="min-w-0 flex-1 text-center">
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
              ) : (
                <div className="home-next-event hover-degrade group flex items-center gap-4 rounded-3xl border-2 border-slate-800/70 bg-slate-900/70 p-4 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 lg:w-80">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/30 via-fuchsia-500/30 to-sky-500/30 text-white">
                    <span className="text-2xl" aria-hidden="true">
                      ♪
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 text-center">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-fuchsia-400">
                      Próximo evento
                    </p>
                    <h2 className="text-lg font-semibold text-white">
                      Nenhum evento próximo
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-slate-400">
                      Crie um novo evento para vê-lo aqui.
                    </p>
                  </div>
                </div>
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
                className="home-dashboard-card group relative rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <span className="absolute right-6 top-6 text-fuchsia-400 transition group-hover:translate-x-1">
                  →
                </span>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
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

                {capas.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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
                className="home-dashboard-card group relative rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <span className="absolute right-6 top-6 text-fuchsia-400 transition group-hover:translate-x-1">
                  →
                </span>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
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

                {eventosPreviewGalerias.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {eventosPreviewGalerias.map((evento) => (
                      <div
                        key={evento.id}
                        className="h-16 w-16 overflow-hidden rounded-xl border border-slate-800/60"
                      >
                        <EventCover
                          capa={evento.capa || evento.images?.[0]}
                          tipo={evento.tipo}
                          titulo={evento.titulo}
                          heightClass="h-full"
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
                className="home-dashboard-card group relative rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <span className="absolute right-6 top-6 text-fuchsia-400 transition group-hover:translate-x-1">
                  →
                </span>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
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

                {tilesPlaylist.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {tilesPlaylist.map(({ evento, capa }) => (
                      <div
                        key={evento.id}
                        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-800/60 bg-gradient-to-br from-orange-500/25 via-fuchsia-500/25 to-sky-500/25"
                      >
                        {capa ? (
                          <img
                            src={capa}
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
                className="home-dashboard-card group relative rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <span className="absolute right-6 top-6 text-fuchsia-400 transition group-hover:translate-x-1">
                  →
                </span>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
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

                {tilesMapa.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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
                className="home-dashboard-card group relative order-5 rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <span className="absolute right-6 top-6 text-fuchsia-400 transition group-hover:translate-x-1">
                  →
                </span>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
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

                {capas.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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

              {/* Bloco: Meus contatos */}
              <Link
                to="/contatos"
                className="home-dashboard-card group relative order-6 self-start rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <span className="absolute right-6 top-6 text-fuchsia-400 transition group-hover:translate-x-1">
                  →
                </span>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Meus contatos
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Encontre as pessoas dos seus eventos e acesse os chats dos grupos.
                  </p>
                </div>
              </Link>

              {/* Bloco: Lixeira geral */}
              <Link
                to="/lixeira"
                aria-label="Abrir lixeira geral"
                className="home-dashboard-card group relative order-8 self-start rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <span aria-hidden="true" className="absolute right-6 top-6 text-fuchsia-400 transition group-hover:translate-x-1">
                  →
                </span>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Lixeira geral
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Acesse as lixeiras de eventos e das fotos das galerias.
                  </p>
                </div>
                {fotosExcluidasHome.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {fotosExcluidasHome.slice(0, 4).map((foto) => (
                      <div
                        key={`${foto.eventoId}-${foto.id}`}
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
                      {fotosExcluidasHome.length}{" "}
                      {fotosExcluidasHome.length === 1
                        ? "foto excluída"
                        : "fotos excluídas"}
                    </div>
                  </div>
                )}
                {eventosExcluidosHome.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    {eventosExcluidosHome.slice(0, 4).map((evento) => (
                      <div
                        key={evento.id}
                        className="h-16 w-16 overflow-hidden rounded-xl border border-slate-800/60 opacity-75"
                      >
                        <EventCover
                          capa={evento.capa || evento.images?.[0]}
                          tipo={evento.tipo}
                          titulo={evento.titulo}
                          heightClass="h-full"
                        />
                      </div>
                    ))}
                    <div className="flex h-16 items-center rounded-xl px-3 text-sm text-slate-400">
                      {eventosExcluidosHome.length}{" "}
                      {eventosExcluidosHome.length === 1
                        ? "evento excluído"
                        : "eventos excluídos"}
                    </div>
                  </div>
                )}
              </Link>

              {/* Bloco: Configurações */}
              <Link
                to="/configuracoes"
                className="home-dashboard-card group relative order-7 self-start rounded-3xl border border-slate-800/70 bg-gradient-to-b from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <span className="absolute right-6 top-6 text-fuchsia-400 transition group-hover:translate-x-1">
                  →
                </span>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Configurações
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Personalize sua conta, privacidade, notificações e aparência.
                  </p>
                </div>
              </Link>
            </div>
          </div>
    </main>
  );
}
