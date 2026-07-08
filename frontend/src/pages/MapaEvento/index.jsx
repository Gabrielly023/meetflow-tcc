import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { buscarEventoPorId } from "../../services/eventoService";
import {
  listarLocais,
  adicionarLocal,
  removerLocal,
  podeRemoverLocal,
  isDonoLocal,
  mapaDoTexto,
} from "../../services/mapaService";
import TituloDegrade from "../../components/TituloDegrade";
import ModalConfirmacao from "../../components/ModalConfirmacao";

const iconeMapa = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0z" />
  </svg>
);

const iconeAbrir = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

// Um cartão de local: mapa embutido + rótulo + abrir no Google Maps + remover.
function CardLocal({ local, podeRemover, onRemover }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20">
      {/* Mapa (visível dentro do app) */}
      {local.embedUrl ? (
        <iframe
          title={local.label}
          src={local.embedUrl}
          className="aspect-[16/9] w-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 bg-slate-950/80 px-6 text-center text-slate-400">
          <span className="text-fuchsia-400">{iconeMapa}</span>
          <p className="text-sm">
            Prévia indisponível para este link (provavelmente encurtado).
          </p>
          <p className="text-xs text-slate-500">
            Use o botão abaixo para abrir no Google Maps, ou cole o link completo
            para ver o mapa aqui.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="truncate texto-gradiente-2 text-lg font-semibold">
            {local.label}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {isDonoLocal(local) ? "Adicionado por você" : "Adicionado por um participante"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {local.linkUrl && (
            <a
              href={local.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
            >
              {iconeAbrir}
              Abrir no Google Maps
            </a>
          )}
          {podeRemover && (
            <button
              type="button"
              onClick={() => onRemover(local)}
              title="Remover local"
              aria-label="Remover local"
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-700 text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapaEvento() {
  const { id } = useParams();
  const evento = buscarEventoPorId(id);

  const [locais, setLocais] = useState(() => listarLocais(id));
  const [link, setLink] = useState("");
  const [label, setLabel] = useState("");
  const [erro, setErro] = useState("");
  const [aRemover, setARemover] = useState(null);

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

  // Prévia padrão (endereço do evento) quando ninguém adicionou local ainda.
  const padrao = mapaDoTexto(evento.local);

  function handleAdicionar(e) {
    e.preventDefault();
    setErro("");
    const res = adicionarLocal(id, link, label);
    if (res.erro === "invalido") {
      setErro(
        "Não reconhecemos esse local. Cole um link do Google Maps, o código de incorporar, ou um endereço.",
      );
      return;
    }
    if (res.erro === "duplicado") {
      setErro("Esse local já foi adicionado.");
      return;
    }
    setLink("");
    setLabel("");
    setLocais(listarLocais(id));
  }

  function confirmarRemocao() {
    if (aRemover) {
      removerLocal(id, aRemover.id);
      setLocais(listarLocais(id));
    }
    setARemover(null);
  }

  return (
    <>
      <ModalConfirmacao
        aberto={aRemover !== null}
        titulo="Remover local"
        mensagem={`Deseja remover "${aRemover?.label}" do mapa deste evento?`}
        textoConfirmar="Remover"
        perigo
        onConfirmar={confirmarRemocao}
        onCancelar={() => setARemover(null)}
      />

      <main className="flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Cabeçalho */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div>
              <p className="texto-gradiente-2 text-sm font-semibold uppercase tracking-[0.3em]">
                Mapa
              </p>
              <h1 className="text-3xl font-semibold text-white">
                <TituloDegrade texto={evento.titulo} />
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {evento.data} · {evento.local}
              </p>
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

          {/* Formulário: adicionar local */}
          <form
            onSubmit={handleAdicionar}
            className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20"
          >
            <p className="texto-gradiente-2 text-lg font-semibold uppercase tracking-[0.3em]">
              Adicionar local
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Cole o link do Google Maps do local do evento (ou o código de
              incorporar). Qualquer participante pode adicionar, para todos
              saberem onde será.
            </p>

            {erro && (
              <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-900/40 px-4 py-3 text-sm text-red-200">
                {erro}
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Nome do local (opcional) — ex.: Entrada principal"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25 sm:col-span-2"
              />
              <textarea
                value={link}
                onChange={(e) => setLink(e.target.value)}
                rows={2}
                placeholder="Cole aqui o link do Google Maps (ex.: https://maps.app.goo.gl/... ou https://www.google.com/maps/place/...)"
                className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95 sm:self-start"
              >
                Adicionar
              </button>
            </div>

          </form>

          {/* Lista de locais (ou prévia do endereço do evento) */}
          {locais.length > 0 ? (
            <div className="space-y-6">
              {locais.map((local) => (
                <CardLocal
                  key={local.id}
                  local={local}
                  podeRemover={podeRemoverLocal(id, local)}
                  onRemover={setARemover}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-dashed border-slate-700 bg-slate-900/60">
              {padrao?.embedUrl ? (
                <iframe
                  title="Endereço do evento"
                  src={padrao.embedUrl}
                  className="aspect-[16/9] w-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : null}
              <div className="p-6 text-center">
                <p className="text-slate-300">
                  Ainda não há um local marcado no mapa.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {padrao
                    ? `Mostrando o endereço cadastrado: "${evento.local}". Adicione o link exato do Google Maps acima para marcar o ponto certo.`
                    : "Adicione o link do Google Maps acima para marcar onde o evento será."}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
