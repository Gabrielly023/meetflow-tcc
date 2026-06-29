export default function EventMap({ location = "Local do evento" }) {
  return (
    <section className="rounded-3xl border border-violet-600/25 ring-1 ring-sky-500/8 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Mapa</p>
          <h2 className="text-2xl font-semibold text-white">Localização</h2>
        </div>
        <span className="rounded-2xl bg-slate-950/90 px-4 py-2 text-sm text-slate-200">{location}</span>
      </div>

      <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-slate-950/90">
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-300">
          <div className="inline-flex items-center rounded-full bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-400">
            Conexão com Maps em breve
          </div>
          <p className="max-w-xs text-sm leading-relaxed">
            Aqui ficará o mapa do evento, integrado ao app de navegação. Enquanto isso, use esta área como pré-visualização.
          </p>
        </div>
      </div>
    </section>
  );
}
