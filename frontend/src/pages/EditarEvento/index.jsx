import { useParams, useNavigate, Link } from "react-router-dom";
import EventoForm from "../../components/EventoForm";
import TituloDegrade from "../../components/TituloDegrade";
import {
  buscarEventoPorId,
  atualizarEvento,
} from "../../services/eventoService";
import {
  getLocalPrincipal,
  adicionarLocal,
  removerLocal,
} from "../../services/mapaService";
import {
  getPlaylistEmbed,
  embedParaSpotify,
  definirPlaylist,
  removerPlaylist,
} from "../../services/playlistService";

export default function EditarEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = buscarEventoPorId(id);

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
              Voltar
            </Link>
          </div>
      </main>
    );
  }

  // Links já existentes (para preencher o formulário e comparar ao salvar)
  const mapaLinkAtual = getLocalPrincipal(evento.id)?.linkUrl || "";
  const embedAtual = getPlaylistEmbed(evento.id);
  const playlistLinkAtual = embedAtual ? embedParaSpotify(embedAtual) : "";

  function handleSalvar(dados) {
    atualizarEvento(evento.id, dados);

    // Mapa: mantém o local principal em sincronia com o campo (troca/remove).
    if (dados.mapaLink !== mapaLinkAtual) {
      const principal = getLocalPrincipal(evento.id);
      if (principal) removerLocal(evento.id, principal.id);
      if (dados.mapaLink) {
        adicionarLocal(evento.id, dados.mapaLink, "Local do evento");
      }
    }

    // Playlist: define, troca ou remove conforme o campo.
    if (dados.playlistLink !== playlistLinkAtual) {
      if (dados.playlistLink) definirPlaylist(evento.id, dados.playlistLink);
      else removerPlaylist(evento.id);
    }

    navigate(`/eventos/${evento.id}`);
  }

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em]">
                  <span className="text-white">Editar </span>
                  <span className="texto-gradiente-2">evento</span>
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  <TituloDegrade texto={evento.titulo} />
                </h1>
              </div>
              <Link
                to={`/eventos/${evento.id}`}
                className="group inline-flex items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
              >
                <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                Voltar ao evento
              </Link>
            </div>

            <EventoForm
              valorInicial={{
                ...evento,
                mapaLink: mapaLinkAtual,
                playlistLink: playlistLinkAtual,
              }}
              onSubmit={handleSalvar}
              textoBotao="Salvar alterações"
              cancelarHref={`/eventos/${evento.id}`}
            />
          </div>
    </main>
  );
}
