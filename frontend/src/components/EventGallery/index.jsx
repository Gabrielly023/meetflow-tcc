export default function EventGallery({ images = [] }) {
  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Galeria</p>
          <h2 className="text-2xl font-semibold text-white">Fotos do evento</h2>
        </div>
        <button className="rounded-2xl bg-slate-950/90 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900">
          Ver todas
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image, index) => (
          <div key={index} className="overflow-hidden rounded-3xl bg-slate-950/80 shadow-inner shadow-black/20">
            <img src={image} alt={`Foto ${index + 1}`} className="h-44 w-full object-cover transition duration-300 hover:scale-105" />
          </div>
        ))}
      </div>
    </section>
  );
}
