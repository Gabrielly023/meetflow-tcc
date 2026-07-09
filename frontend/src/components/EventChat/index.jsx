import { Link } from "react-router-dom";
import { buscarEventoPorId } from "../../services/eventoService";
import {
  listarMensagens,
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

// Prévia do chat dentro do detalhe do evento: mostra as últimas mensagens e
// um resumo, e leva à página completa (/eventos/:id/chat). O chat "cheio"
// (enviar, responder, reagir, imagem, editar, apagar, busca, leitura) fica lá.

function Avatar({ nome }) {
  return (
    <div
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${corDoNome(
        nome,
      )} text-[10px] font-bold text-white`}
    >
      {iniciais(nome)}
    </div>
  );
}

export default function EventChat({ eventoId }) {
  const evento = buscarEventoPorId(eventoId);
  const mensagens = (listarMensagens(eventoId) || [])
    .filter((m) => m.tipo !== "sistema" && !m.deleted)
    .slice(-3);
  const participantes = listarParticipantes(eventoId);
  const naoLidas = contarNaoLidas(eventoId);

  const nomeGrupo = getNomeGrupo(eventoId, evento?.titulo || "");
  const fotoGrupo = getFotoGrupo(eventoId);
  const papel = getPapelDeParede(eventoId);
  const temPapel = papel && papel !== "padrao";

  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Bolinha com a foto do grupo (ou iniciais) */}
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-800">
            {fotoGrupo ? (
              <img src={fotoGrupo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${corDoNome(
                  nomeGrupo,
                )} text-sm font-bold text-white`}
              >
                {iniciais(nomeGrupo)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm uppercase tracking-[0.3em] text-fuchsia-400">
              {evento?.titulo || "Chat do evento"}
            </p>
            <h2 className="truncate text-2xl font-semibold text-white">{nomeGrupo}</h2>
          </div>
        </div>
        <div className="shrink-0 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20">
          {participantes.length}{" "}
          {participantes.length === 1 ? "participante" : "participantes"}
        </div>
      </div>

      {mensagens.length > 0 ? (
        <div
          className={temPapel ? "rounded-2xl p-3" : ""}
          style={estiloPapelDeParede(papel)}
        >
          <div className="space-y-3">
            {mensagens.map((m) => (
              <div key={m.id} className="flex items-start gap-2">
                <Avatar nome={m.ownerId === "sistema" ? "?" : m.sender} />
                <div className="min-w-0 rounded-2xl bg-slate-950/70 px-4 py-2 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-fuchsia-300">{m.sender}</p>
                    <span className="text-[10px] text-slate-500">
                      {tempoRelativo(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-300">
                    {m.audioUrl
                      ? "🎤 Áudio"
                      : m.imageUrl && !m.text
                        ? "📷 Foto"
                        : m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
          <p className="text-slate-300">Nenhuma mensagem ainda.</p>
          <p className="mt-1 text-sm text-slate-500">
            Abra o chat e comece a conversa com os participantes.
          </p>
        </div>
      )}

      <Link
        to={`/eventos/${eventoId}/chat`}
        className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-100"
      >
        Abrir chat completo
        {naoLidas > 0 && (
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">
            {naoLidas} nova{naoLidas > 1 ? "s" : ""}
          </span>
        )}
      </Link>
    </section>
  );
}
