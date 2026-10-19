import { useEffect, useRef } from "react";

const SELETORES_FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useDialogA11y(aberto, onFechar) {
  const dialogRef = useRef(null);
  const fecharRef = useRef(onFechar);
  useEffect(() => {
    fecharRef.current = onFechar;
  }, [onFechar]);

  useEffect(() => {
    if (!aberto) return undefined;

    const dialog = dialogRef.current;
    const focoAnterior = document.activeElement;
    const listarFocaveis = () =>
      [...(dialog?.querySelectorAll(SELETORES_FOCAVEIS) || [])].filter(
        (elemento) => elemento.getClientRects().length > 0,
      );

    (listarFocaveis()[0] || dialog)?.focus();

    function controlarTeclas(evento) {
      if (evento.key === "Escape") {
        fecharRef.current?.();
        return;
      }

      if (evento.key !== "Tab") return;

      const focaveis = listarFocaveis();
      if (focaveis.length === 0) {
        evento.preventDefault();
        dialog?.focus();
        return;
      }

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      } else if (!dialog?.contains(document.activeElement)) {
        evento.preventDefault();
        (evento.shiftKey ? ultimo : primeiro).focus();
      }
    }

    document.addEventListener("keydown", controlarTeclas);
    return () => {
      document.removeEventListener("keydown", controlarTeclas);
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) {
        focoAnterior.focus();
      }
    };
  }, [aberto]);

  return dialogRef;
}
