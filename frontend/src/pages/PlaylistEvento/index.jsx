import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { buscarEventoPorId } from "../../services/eventoService";
import {
  carregarPlaylist,
  embedParaSpotify,
  embedParaUri,
  definirPlaylist,
  removerPlaylist,
  setUltimaPlaylist,
} from "../../services/playlistService";
import { usePlayer } from "../../context/PlayerContext";
import TituloDegrade from "../../components/TituloDegrade";

export default function PlaylistEvento() {
  const { id } = useParams();
  const { tocar } = usePlayer();

  const [eventoCarregado, setEventoCarregado] = useState(null);
  const evento =
    eventoCarregado?.id === id ? eventoCarregado.dados : null;
  const carregandoEvento = eventoCarregado?.id !== id;
  const [embed, setEmbed] = useState(null);
const [carregando, setCarregando] = useState(true);
const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [link, setLink] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState(false);

useEffect(() => {
  let ativo = true;

  buscarEventoPorId(id)
    .then((dados) => {
      if (ativo) setEventoCarregado({ id, dados });
    })
    .catch((error) => {
      console.error("Erro ao carregar evento da playlist:", error);
      if (ativo) setEventoCarregado({ id, dados: null });
    });

  return () => {
    ativo = false;
  };
}, [id]);

useEffect(() => {
  let ativo = true;

  async function carregar() {
    try {
      const playlistCarregada = await carregarPlaylist(id);
      if (ativo) setEmbed(playlistCarregada);
    } catch (error) {
      console.error("Erro ao carregar playlist:", error);
      if (ativo) setErro("Não foi possível carregar a playlist.");
    } finally {
      if (ativo) setCarregando(false);
    }
  }

  carregar();

  return () => {
    ativo = false;
  };
}, [id]);

  if (carregandoEvento) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <p role="status" className="text-slate-300">Carregando evento…</p>
      </main>
    );
  }

  if (!evento) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-red-500/40 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-semibold">Evento não encontrado</h1>
          <p className="mt-4 text-slate-300">
            Verifique se o link está correto ou volte para a página de eventos.
          </p>
          <Link
            to="/eventos"
            className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
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

  async function salvar(e) {
  e.preventDefault();
  setErro("");
  setSalvando(true);

  try {
    const novo = await definirPlaylist(id, link);

    if (!novo) {
      setErro(
        "Link inválido. Copie o link da playlist em Compartilhar → Copiar link no Spotify."
      );
      return;
    }

    setEmbed(novo);
    setEditando(false);
    setLink("");
  } catch (error) {
    console.error("Erro ao salvar playlist:", error);
    setErro(
      error.response?.data?.mensagem ||
      "Não foi possível salvar a playlist. Tente novamente."
    );
  } finally {
    setSalvando(false);
  }
}

async function remover() {
  setErro("");
  setSalvando(true);

  try {
    const proximaPlaylist = await removerPlaylist(id);
    setEmbed(proximaPlaylist);
    setEditando(false);
  } catch (error) {
    console.error("Erro ao remover playlist:", error);
    setErro(
      error.response?.data?.mensagem ||
      "Não foi possível remover a playlist. Tente novamente."
    );
  } finally {
    setSalvando(false);
  }
}

  function salvarMusica(e) {
    e.preventDefault();
    const resultado = adicionarMusica(id, linkMusica);

    if (resultado.erro === "duplicada") {
      setErroMusica("Essa música já está na lista do evento.");
      return;
    }

    if (resultado.erro) {
      setErroMusica(
        "Não reconhecemos esse link. Copie o link de uma música no Spotify (Compartilhar → Copiar link)."
      );
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


  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Cabeçalho da página */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em]">
              <span className="texto-gradiente-2">Playlist</span>
              <span className="text-white"> do evento</span>
            </p>

            <h1 className="text-4xl font-semibold text-white">
              <TituloDegrade texto={evento.titulo} />
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {evento.data} · {evento.local}
            </p>
          </div>

          <Link
            to={`/eventos/${id}`}
            className="group inline-flex items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
          >
            <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Voltar ao evento
          </Link>
        </div>

        {/* Player / gerenciamento da playlist */}
        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
        {carregando && (
              <p className="py-4 text-center text-sm text-slate-400">
                 Carregando playlist...
             </p>
      )}
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-white">
                {playlist.name || "Playlist do evento"}
              </p>

              {playlist.description && (
                <p className="mt-1 text-sm text-slate-400">
                  {playlist.description}
                </p>
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
            <form
              onSubmit={salvar}
              className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-5"
            >
              <label className="block text-sm font-medium text-white">
                Link da playlist do Spotify
              </label>

              <p className="mt-1 text-xs text-slate-400">
                No Spotify, abra a playlist → botão{" "}
                <span className="text-slate-200">Compartilhar</span> →{" "}
                <span className="text-slate-200">Copiar link</span>, e cole aqui.
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
                  disabled={salvando}
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
                  onClick={() => {
                    setUltimaPlaylist(id);
                    tocar(embedParaUri(embed), evento.titulo);
                  }}
                  title="Tocar na barra do site"
                  aria-label="Tocar na barra do site"
                  className="absolute right-5 top-16 h-14 w-14 cursor-pointer rounded-full"
                />
              </div>

              {!editando && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setUltimaPlaylist(id);
                      tocar(embedParaUri(embed), evento.titulo);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
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

                  <button
                    type="button"
                    onClick={abrirFormulario}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Trocar playlist
                  </button>

                  <button
                    type="button"
                    disabled={salvando}
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
                <p className="text-base font-medium text-white">
                  Este evento ainda não tem uma playlist.
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Adicione uma playlist do Spotify para animar o evento — é só colar o link.
                </p>
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
        
      </div>
    </main>
  );
}