import { useEffect } from "react";

// Modal de confirmação com o design do site (substitui o window.confirm).
export default function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  perigo = false,
  onConfirmar,
  onCancelar,
}) {
  // Fecha com a tecla Esc
  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(evt) {
      if (evt.key === "Escape") onCancelar?.();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, onCancelar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* fundo */}
      <div
        className="modal-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onCancelar}
      />

      {/* card */}
      <div className="modal-entrada relative w-full max-w-md rounded-3xl border border-slate-700/70 bg-slate-900/95 p-6 shadow-2xl shadow-black/50">
        <h2 className="text-xl font-semibold text-white">{titulo}</h2>
        {mensagem && (
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {mensagem}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-2xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className={
              perigo
                ? "rounded-2xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600"
                : "rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-90"
            }
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
