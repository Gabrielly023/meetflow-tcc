import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import {
  listarParticipantes,
  adicionarParticipante,
  removerParticipante,
} from "../../services/chatService";

export default function EditarEvento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mapaLinkAtual, setMapaLinkAtual] = useState("");
  const [carregandoMapa, setCarregandoMapa] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarEvento() {
      setCarregando(true);
      setCarregandoMapa(true);

      try {
        const dados = await buscarEventoPorId(id);

        if (!ativo) return;

        setEvento(dados);

        try {
          const principal = await getLocalPrincipal(dados.id);

          if (ativo) {
            setMapaLinkAtual(principal?.linkUrl || "");
          }
        } catch (erro) {
          console.error("Erro ao carregar mapa do evento:", erro);

          if (ativo) setMapaLinkAtual("");
        } finally {
          if (ativo) setCarregandoMapa(false);
        }
      } catch (erro) {
        console.error("Erro ao carregar evento:", erro);

        if (ativo) {
          setEvento(null);
          setMapaLinkAtual("");
          setCarregandoMapa(false);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarEvento();

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando || carregandoMapa) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <p role="status" className="text-slate-300">
          Carregando evento...
        </p>
      </main>
    );
  }

  if (!evento) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-red-500/40 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-semibold">
            Evento não encontrado
          </h1>
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

  const embedAtual = getPlaylistEmbed(evento.id);
  const playlistLinkAtual = embedAtual
    ? embedParaSpotify(embedAtual)
    : "";
  const participantesAtuais = listarParticipantes(evento.id);

  async function handleSalvar(dados) {
    await atualizarEvento(evento.id, dados);

    const nomesFinais = new Set(
      (dados.participantes || []).map((nome) => nome.toLowerCase()),
    );

    for (const participante of participantesAtuais) {
      if (!nomesFinais.has(participante.name.toLowerCase())) {
        await removerParticipante(evento.id, participante.id);
      }
    }

    const nomesAtuais = new Set(
      participantesAtuais.map((participante) =>
        participante.name.toLowerCase(),
      ),
    );

    for (const nome of dados.participantes || []) {
      if (nomesAtuais.has(nome.toLowerCase())) continue;

      const resultado = await adicionarParticipante(evento.id, nome);

      if (resultado?.erro) {
        throw new Error(`Não foi possível adicionar "${nome}" ao grupo.`);
      }
    }

    // Atualiza o mapa somente se o link foi alterado.
    const novoMapaLink = (dados.mapaLink || "").trim();

    if (novoMapaLink !== mapaLinkAtual) {
      const principal = await getLocalPrincipal(evento.id);

      if (principal) {
        const removido = await removerLocal(evento.id, principal.id);

        if (!removido) {
          throw new Error(
            "Não foi possível remover o mapa atual. Verifique se você é o organizador do evento.",
          );
        }
      }

      if (novoMapaLink) {
        const resultado = await adicionarLocal(
          evento.id,
          novoMapaLink,
          "Local do evento",
        );

        if (resultado?.erro || !resultado?.local) {
          throw new Error(
            resultado?.erro === "sem_permissao"
              ? "Somente o organizador pode alterar o mapa do evento."
              : "Não foi possível salvar o novo mapa. Confira o link e tente novamente.",
          );
        }
      }
    }

    // Define, troca ou remove a playlist conforme o campo.
    if (dados.playlistLink !== playlistLinkAtual) {
      if (dados.playlistLink) {
        await definirPlaylist(evento.id, dados.playlistLink);
      } else {
        await removerPlaylist(evento.id);
      }
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
            participantes: participantesAtuais.map(
              (participante) => participante.name,
            ),
          }}
          onSubmit={handleSalvar}
          textoBotao="Salvar alterações"
          cancelarHref={`/eventos/${evento.id}`}
          permitirParticipantes
        />
      </div>
    </main>
  );
}