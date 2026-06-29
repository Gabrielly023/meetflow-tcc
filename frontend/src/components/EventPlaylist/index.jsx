export default function EventPlaylist({ playlist = {} }) {
  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Playlist</p>
          <h2 className="text-2xl font-semibold text-white">Trilha exclusiva do evento</h2>
        </div>
        <span className="rounded-2xl bg-slate-950/90 px-4 py-2 text-sm text-slate-200">Spotify</span>
      </div>

      <div className="rounded-3xl bg-slate-950/90 p-5 text-slate-300">
        <p className="text-base font-medium text-white">{playlist.name || "Playlist do evento"}</p>
        <p className="mt-2 text-sm text-slate-400">{playlist.description || "Em breve vamos conectar ao Spotify para um player exclusivo deste evento."}</p>
        <button className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
          Conectar Spotify
        </button>
      </div>
    </section>
  );
}
