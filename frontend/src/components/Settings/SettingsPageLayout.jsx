import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ActionButton } from "./SettingsPrimitives";

export default function SettingsPageLayout({
  titulo,
  descricao,
  secoes,
  children,
  alterado = false,
  salvando = false,
  onSalvar,
  onDescartar,
}) {
  const location = useLocation();
  const [secaoAtiva, setSecaoAtiva] = useState(secoes[0]?.id);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visiveis[0]) setSecaoAtiva(visiveis[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    secoes.forEach(({ id }) => {
      const elemento = document.getElementById(id);
      if (elemento) observador.observe(elemento);
    });
    return () => observador.disconnect();
  }, [secoes, location.pathname]);

  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 100);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (!alterado) return undefined;
    function avisarAoSair(evento) {
      evento.preventDefault();
      evento.returnValue = "";
    }
    function confirmarNavegacao(evento) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;
      const link = alvo.closest("a[href]");
      if (!link || link.origin !== window.location.origin) return;
      const destino = new URL(link.href);
      if (destino.pathname === window.location.pathname) return;
      if (!window.confirm("Você tem alterações não salvas. Deseja sair sem salvar?")) {
        evento.preventDefault();
        evento.stopImmediatePropagation();
      }
    }
    window.addEventListener("beforeunload", avisarAoSair);
    document.addEventListener("click", confirmarNavegacao, true);
    return () => {
      window.removeEventListener("beforeunload", avisarAoSair);
      document.removeEventListener("click", confirmarNavegacao, true);
    };
  }, [alterado]);

  return (
    <main className="settings-page-main min-w-0 flex-1 overflow-x-clip px-4 py-7 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="settings-page-heading mb-7 flex w-full flex-col items-center text-center">
          <Link
            to="/configuracoes"
            className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
          >
            <span aria-hidden="true">←</span> Voltar para Configurações
          </Link>
          <nav aria-label="Navegação estrutural" className="mt-3 text-sm text-slate-500">
            <ol className="flex flex-wrap items-center justify-center gap-2">
              <li><Link to="/configuracoes" className="hover:text-fuchsia-300">Configurações</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-300">{titulo}</li>
            </ol>
          </nav>
          <p className="texto-gradiente-2 mt-5 text-sm font-semibold uppercase tracking-[0.28em] sm:text-base">
            Preferências da conta
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">{titulo}</h1>
          <p className="mx-auto mt-2 w-full max-w-3xl text-center text-sm leading-relaxed text-slate-400">{descricao}</p>
        </header>

        <nav
          aria-label={`Seções de ${titulo}`}
          className="sticky top-[5.5rem] z-20 mb-6 overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/90 p-2 shadow-xl shadow-black/20 backdrop-blur"
        >
          <ul className="flex min-w-max gap-2">
            {secoes.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={secaoAtiva === id ? "location" : undefined}
                  onClick={() => setSecaoAtiva(id)}
                  className={`inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${
                    secaoAtiva === id
                      ? "bg-violet-500/20 text-fuchsia-200"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-5">{children}</div>
      </div>

      {alterado && (
        <div
          role="region"
          aria-label="Alterações pendentes"
          className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-fuchsia-400/30 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-slate-200">Você tem alterações não salvas.</p>
          <div className="flex gap-2">
            <ActionButton variant="secondary" onClick={onDescartar}>Descartar</ActionButton>
            <ActionButton onClick={onSalvar} loading={salvando}>Salvar alterações</ActionButton>
          </div>
        </div>
      )}
    </main>
  );
}
