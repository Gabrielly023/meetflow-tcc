// Botão "Continuar com o Google" (visual; a integração real vem depois).
export default function GoogleButton({ onClick, texto = "Continuar com o Google" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/40 py-3 text-sm font-medium text-slate-100 transition duration-300 hover:scale-[1.02] hover:border-slate-500 hover:bg-slate-800/60 active:scale-95"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 5.04c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.72 14.97.72 12 .72 7.7.72 3.99 3.19 2.18 6.79l3.66 2.84C6.71 6.99 9.14 5.04 12 5.04z"
        />
        <path
          fill="#4285F4"
          d="M23.28 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.34c-.27 1.44-1.1 2.66-2.35 3.48l3.61 2.8c2.11-1.95 3.32-4.82 3.32-8.52z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.37c-.23-.69-.36-1.42-.36-2.17s.13-1.48.36-2.17L2.18 7.19C1.43 8.68 1 10.29 1 12s.43 3.32 1.18 4.81l3.66-2.44z"
        />
        <path
          fill="#34A853"
          d="M12 23.28c2.97 0 5.46-.98 7.28-2.66l-3.61-2.8c-1 .67-2.29 1.06-3.67 1.06-2.86 0-5.29-1.95-6.16-4.57l-3.66 2.44C3.99 20.81 7.7 23.28 12 23.28z"
        />
      </svg>
      {texto}
    </button>
  );
}
