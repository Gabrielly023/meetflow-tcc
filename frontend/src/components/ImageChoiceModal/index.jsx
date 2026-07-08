// Pequeno modal que aparece ao clicar em "alterar imagem" quando JÁ existe uma
// imagem: pergunta se a pessoa quer só ajustar a atual ou enviar outra.
// Props: onAdjust(), onPick(), onCancel().
export default function ImageChoiceModal({ onAdjust, onPick, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white">Alterar imagem</h2>
        <p className="mt-1 text-sm text-slate-400">
          O que você quer fazer com a imagem atual?
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onAdjust}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-fuchsia-500/50 hover:bg-slate-800"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/30 via-fuchsia-500/30 to-sky-500/30 text-fuchsia-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-5.209 1.245l5.209 1.245m0 0l4.827-2.787m0 0a4.5 4.5 0 002.48.044l.803-.215-7.794-4.5" />
              </svg>
            </span>
            <div>
              <p>Ajustar a imagem atual</p>
              <p className="text-xs font-normal text-slate-400">
                Reposicionar ou dar zoom na foto que já está aqui
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onPick}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-fuchsia-500/50 hover:bg-slate-800"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/30 via-fuchsia-500/30 to-sky-500/30 text-fuchsia-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </span>
            <div>
              <p>Escolher outra imagem</p>
              <p className="text-xs font-normal text-slate-400">
                Enviar uma nova foto do dispositivo
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:text-slate-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
