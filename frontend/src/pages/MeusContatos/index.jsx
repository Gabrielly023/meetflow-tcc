import { Link } from "react-router-dom";
import { ordenarPorData, listarEventos } from "../../services/eventoService";
import {
  listarParticipantes,
  getNomeGrupo,
  getFotoGrupo,
  ultimaMensagem,
  tempoRelativo,
  iniciais,
  corDoNome,
  contarNaoLidas,
} from "../../services/chatService";

function AvatarContato({ nome }) {
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${corDoNome(
        nome,
      )} text-sm font-bold text-white ring-2 ring-slate-900`}
    >
      {iniciais(nome)}
    </div>
  );
}

export default function MeusContatos() {
  const eventos = ordenarPorData(listarEventos());

  const linhas = eventos
    .map((evento) => {
      const participantes = listarParticipantes(evento.id);
      const ultima = ultimaMensagem(evento.id);
      return {
        evento,
        participantes,
        ultima,
        nomeGrupo: getNomeGrupo(evento.id, evento.titulo),
        fotoGrupo: getFotoGrupo(evento.id),
        naoLidas: contarNaoLidas(evento.id),
      };
    })
    .sort((a, b) => (b.ultima?.createdAt || 0) - (a.ultima?.createdAt || 0));

  const totalContatos = new Set(
    linhas.flatMap((linha) => linha.participantes.map((p) => p.name)),
  ).size;
  const totalParticipacoes = linhas.reduce(
    (soma, linha) => soma + linha.participantes.length,
    0,
  );

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="texto-gradiente-2 text-sm font-semibold uppercase tracking-[0.3em]">
              Contatos
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Meus <span className="texto-gradiente">contatos</span>
            </h1>
            <p className="mt-2 text-slate-400">
              As pessoas que participam dos meus eventos, organizadas por grupo
              e com acesso rápido ao chat de cada um.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
              <p className="texto-gradiente-2 text-3xl font-semibold">{eventos.length}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                {eventos.length === 1 ? "evento" : "eventos"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
              <p className="texto-gradiente-2 text-3xl font-semibold">{totalContatos}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                contatos únicos
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
              <p className="texto-gradiente-2 text-3xl font-semibold">{totalParticipacoes}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                participações
              </p>
            </div>
          </div>
        </div>

        {linhas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-gradient-to-br from-violet-500/30 via-slate-900/40 to-sky-500/30 p-16 text-center text-slate-300">
            Você ainda não tem contatos salvos nos eventos.
          </div>
        ) : (
          <div className="space-y-4">
            {linhas.map(({ evento, participantes, ultima, nomeGrupo, fotoGrupo, naoLidas }) => {
              const recentes = participantes.slice(0, 6);
              return (
                <Link
                  key={evento.id}
                  to={`/eventos/${evento.id}/chat`}
                  className="group flex items-start gap-4 rounded-3xl border border-slate-800/70 bg-gradient-to-br from-violet-500/35 via-slate-900/70 to-sky-500/35 p-4 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20"
                >
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/50">
                      {fotoGrupo || evento.capa ? (
                        <img
                          src={fotoGrupo || evento.capa}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500/20 via-fuchsia-500/20 to-sky-500/20 text-xs uppercase tracking-wide text-white/70">
                          {evento.tipo}
                        </div>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
                      {participantes.length} {participantes.length === 1 ? "contato" : "contatos"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
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

                    <p className="mt-2 text-sm text-slate-400">
                      {participantes.length > 0
                        ? "Pessoas presentes neste evento e disponíveis para conversar no chat do grupo."
                        : "Ainda não há participantes adicionados."}
                    </p>

                    {recentes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recentes.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-950/60 px-2.5 py-1.5"
                          >
                            <AvatarContato nome={p.name} />
                            <span className="max-w-[140px] truncate text-xs text-slate-200">
                              {p.name}
                            </span>
                          </div>
                        ))}
                        {participantes.length > 6 && (
                          <span className="rounded-full border border-slate-800/60 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-400">
                            +{participantes.length - 6}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {participantes.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 rounded-2xl border border-slate-800/60 bg-slate-950/40 px-2 py-1"
                        >
                          <AvatarContato nome={p.name} />
                          <div className="min-w-0">
                            <p className="max-w-[160px] truncate text-xs font-medium text-slate-200">
                              {p.name}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                              contato do evento
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{participantes.length} participantes</span>
                      <span>•</span>
                      <span>{naoLidas} não lidas</span>
                    </div>
                  </div>

                  <span className="mt-1 shrink-0 text-fuchsia-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}