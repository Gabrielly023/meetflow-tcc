import { Link } from "react-router-dom";
import { listarEventos, ordenarPorData } from "../../services/eventoService";
import {
  listarMensagens,
  ultimaMensagem,
  listarParticipantes,
  contarNaoLidas,
  getNomeGrupo,
  getFotoGrupo,
  getPapelDeParede,
  estiloPapelDeParede,
  tempoRelativo,
  iniciais,
  corDoNome,
} from "../../services/chatService";

// Página geral: reúne o chat de todos os eventos num só lugar (estilo lista de
// conversas). Cada linha leva ao chat completo do evento (/eventos/:id/chat).

// Avatar mini para os balões do mostruário.
function MiniAvatar({ nome }) {
  return (
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${corDoNome(
        nome,
      )} text-[9px] font-bold text-white`}
    >
      {iniciais(nome)}
    </div>
  );
}

// Texto curto de uma mensagem para o balão do mostruário.
function textoBalao(m) {
  if (m.tipo === "sistema") return m.text;
  const autor = m.sender === "Você" ? "Você" : m.sender;
  const corpo = m.audioUrl
    ? "🎤 Áudio"
    : m.imageUrl && !m.text
      ? "📷 Foto"
      : m.text;
  return `${autor}: ${corpo}`;
}

export default function MeusChats() {
  const eventos = ordenarPorData(listarEventos());

  const linhas = eventos.map((ev) => {
    const ultima = ultimaMensagem(ev.id);
    return {
      evento: ev,
      ultima,
      recentes: (listarMensagens(ev.id) || []).filter((m) => !m.deleted).slice(-3),
      naoLidas: contarNaoLidas(ev.id),
      participantes: listarParticipantes(ev.id).length,
      nomeGrupo: getNomeGrupo(ev.id, ev.titulo),
      fotoGrupo: getFotoGrupo(ev.id),
      papel: getPapelDeParede(ev.id),
    };
  });

  // Mostra primeiro os chats com mensagem mais recente.
  linhas.sort((a, b) => (b.ultima?.createdAt || 0) - (a.ultima?.createdAt || 0));

  const totalNaoLidas = linhas.reduce((soma, l) => soma + l.naoLidas, 0);

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="texto-gradiente-2 text-sm font-semibold uppercase tracking-[0.3em]">
              Chats
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Meus <span className="texto-gradiente">chats</span>
            </h1>
            <p className="mt-2 text-slate-400">
              As conversas de todos os meus eventos, lado a lado. Clique em uma
              para abrir o chat.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 p-[1.5px] shadow-lg shadow-violet-500/25">
            <div className="rounded-2xl bg-slate-900 px-5 py-3 text-center">
              <p className="texto-gradiente-2 text-2xl font-semibold">{totalNaoLidas}</p>
              <p className="text-xs text-slate-400">
                {totalNaoLidas === 1 ? "mensagem não lida" : "mensagens não lidas"}
              </p>
            </div>
          </div>
        </div>

        {linhas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-gradient-to-br from-violet-500/40 via-slate-900/40 to-sky-500/40 p-16 text-center text-slate-300">
            Você ainda não tem eventos.
          </div>
        ) : (
          <div className="space-y-3">
            {linhas.map(({ evento, ultima, recentes, naoLidas, participantes, nomeGrupo, fotoGrupo, papel }) => {
              const temPapel = papel && papel !== "padrao";
              return (
                <Link
                  key={evento.id}
                  to={`/eventos/${evento.id}/chat`}
                  className="group flex items-start gap-4 rounded-3xl border border-slate-800/70 bg-gradient-to-br from-violet-500/40 via-slate-900/40 to-sky-500/40 p-4 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
                >
                  {/* Capa do evento + bolinha com a foto do grupo embaixo */}
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl">
                      {evento.capa ? (
                        <img src={evento.capa} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500/30 via-fuchsia-500/30 to-sky-500/30 text-xs uppercase text-white/80">
                          {evento.tipo}
                        </div>
                      )}
                    </div>
                    {/* Foto do grupo (ou iniciais) */}
                    <div
                      className="-mt-4 h-10 w-10 overflow-hidden rounded-full ring-2 ring-slate-900"
                      title={`Grupo: ${nomeGrupo}`}
                    >
                      {fotoGrupo ? (
                        <img src={fotoGrupo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${corDoNome(
                            nomeGrupo,
                          )} text-[11px] font-bold text-white`}
                        >
                          {iniciais(nomeGrupo)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nome do grupo + evento + mostruário */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-fuchsia-400">
                          {evento.titulo}
                        </p>
                        <h2 className="truncate texto-gradiente-2 text-lg font-semibold">
                          {nomeGrupo}
                        </h2>
                      </div>
                      {ultima && (
                        <span className="shrink-0 text-xs text-slate-500">
                          {tempoRelativo(ultima.createdAt)}
                        </span>
                      )}
                    </div>

                    {/* Mostruário horizontal do chat (com o papel de parede ao fundo) */}
                    {recentes.length > 0 ? (
                      <div
                        className={`mt-2 flex gap-2 rounded-xl ${temPapel ? "p-2" : ""}`}
                        style={estiloPapelDeParede(papel)}
                      >
                        {recentes.map((m) => (
                          <div
                            key={m.id}
                            className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-slate-950/70 px-2.5 py-1.5 backdrop-blur"
                          >
                            {m.tipo !== "sistema" && (
                              <MiniAvatar nome={m.sender} />
                            )}
                            <span
                              className={`truncate text-xs ${
                                m.tipo === "sistema"
                                  ? "italic text-slate-500"
                                  : "text-slate-300"
                              }`}
                            >
                              {textoBalao(m)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">Nenhuma mensagem ainda.</p>
                    )}

                    <p className="mt-1.5 text-xs text-slate-500">
                      {participantes}{" "}
                      {participantes === 1 ? "participante" : "participantes"}
                    </p>
                  </div>

                  {/* Não lidas */}
                  {naoLidas > 0 && (
                    <span className="mt-1 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-2 text-xs font-bold text-white">
                      {naoLidas}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
