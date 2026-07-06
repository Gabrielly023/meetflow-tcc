import { useState } from "react";

// Mostra a capa do evento. Se não houver capa OU se a imagem falhar ao carregar
// (link quebrado / que não é imagem direta), cai para o banner gradiente da marca.
export default function EventCover({
  capa,
  tipo,
  titulo = "",
  heightClass = "h-40",
  imgClass = "",
}) {
  // key={capa} no <img> garante que uma nova capa sempre tente carregar de novo
  const [erro, setErro] = useState(false);

  if (capa && !erro) {
    return (
      <div className={`${heightClass} w-full overflow-hidden`}>
        <img
          key={capa}
          src={capa}
          alt={`Capa do evento ${titulo}`}
          onError={() => setErro(true)}
          className={`h-full w-full object-cover ${imgClass}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex ${heightClass} w-full items-center justify-center bg-gradient-to-br from-orange-500/25 via-fuchsia-500/25 to-sky-500/25`}
    >
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
        {tipo}
      </span>
    </div>
  );
}
