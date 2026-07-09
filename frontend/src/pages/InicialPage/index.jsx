import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Reveal from "../../components/Reveal";
import "./Home.css";

const LINKS_HEADER = [
  { label: "Recursos", href: "#recursos" },
  { label: "Entrar", href: "/login" },
  { label: "Criar conta", href: "/signup" },
];

const RECURSOS = [
  {
    titulo: "Eventos",
    descricao:
      "Crie, personalize com capa e gerencie todos os meus eventos em um só lugar.",
    gradiente: "from-orange-500 via-fuchsia-500 to-sky-500",
    icone:
      "M6.75 3v2.25M17.25 3v2.25M3 8.25h18M4.5 4.5h15A1.5 1.5 0 0121 6v13.5A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V6a1.5 1.5 0 011.5-1.5z",
  },
  {
    titulo: "Chat do evento",
    descricao:
      "Converse com os participantes em tempo real e alinhe cada detalhe.",
    gradiente: "from-sky-500 to-violet-500",
    icone: "M7.5 8.25h9m-9 3.75h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    titulo: "Galeria",
    descricao:
      "Reúna as fotos do evento em uma galeria bonita e compartilhável.",
    gradiente: "from-fuchsia-500 to-sky-500",
    icone:
      "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  },
  {
    titulo: "Playlists",
    descricao:
      "Monte a trilha sonora perfeita e conecte ao Spotify do evento.",
    gradiente: "from-sky-500 to-violet-500",
    icone:
      "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z",
  },
  {
    titulo: "Localização",
    descricao:
      "Mostre onde o evento acontece e ajude todo mundo a chegar lá.",
    gradiente: "from-orange-500 via-fuchsia-500 to-sky-500",
    icone:
      "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0z",
  },
  {
    titulo: "Participantes",
    descricao:
      "Convide pessoas, organize confirmações e defina quem é organizador.",
    gradiente: "from-sky-500 to-violet-500",
    icone:
      "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
];

const PASSOS = [
  {
    numero: "1",
    titulo: "Crie seu evento",
    descricao: "Escolha uma capa, defina data, local e o clima do encontro.",
  },
  {
    numero: "2",
    titulo: "Convide e combine",
    descricao: "Adicione participantes e use o chat para alinhar tudo.",
  },
  {
    numero: "3",
    titulo: "Curta e registre",
    descricao: "Toque a playlist e reúna as melhores fotos na galeria.",
  },
];

const CATEGORIAS = [
  "Shows",
  "Aniversários",
  "Workshops",
  "Casamentos",
  "Piqueniques",
  "Meetups",
  "Festas",
  "Feiras",
  "Confraternizações",
  "Formaturas",
];

const GALERIA = [
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
];

const CARDS_HERO = [
  {
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500&q=80",
    label: "Noite de Música",
    tipo: "Show",
    data: "12 Jul · 20:00",
    classe: "flutuar",
  },
  {
    img: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=80",
    label: "Piquenique no Parque",
    tipo: "Outdoor",
    data: "27 Jul · 16:00",
    classe: "flutuar-2 sm:mt-10",
  },
  {
    img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80",
    label: "Workshop de Design",
    tipo: "Tecnologia",
    data: "21 Jul · 14:00",
    classe: "flutuar-3",
  },
];

export default function Home() {
  // Atualiza a variável --scroll (0 -> 1) para a barra de progresso e o hue-rotate
  useEffect(() => {
    let animando = false;

    function atualizar() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progresso = max > 0 ? doc.scrollTop / max : 0;
      doc.style.setProperty("--scroll", String(progresso));
      animando = false;
    }

    function aoRolar() {
      // Atualiza no máximo uma vez por frame, deixando o efeito fluido
      if (!animando) {
        animando = true;
        requestAnimationFrame(atualizar);
      }
    }

    window.addEventListener("scroll", aoRolar, { passive: true });
    atualizar();
    return () => {
      window.removeEventListener("scroll", aoRolar);
      document.documentElement.style.removeProperty("--scroll");
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="home-progress" />

      {/* Fundo animado com "blobs" que mudam de cor ao rolar */}
      <div className="home-bg">
        <div className="home-blob home-blob-1" />
        <div className="home-blob home-blob-2" />
        <div className="home-blob home-blob-3" />
      </div>

      <div className="relative z-10">
        <Header links={LINKS_HEADER} />

        <main>
          {/* ===================== HERO ===================== */}
          <section className="mx-auto max-w-6xl px-6 pb-24 text-center">
            {/* Primeira tela: só a logo + a frase de efeito */}
            <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center">
              <Reveal>
                <div className="flutuar mb-14 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-6">
                  <span className="fonte-flow flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-6xl font-bold text-white shadow-2xl shadow-fuchsia-500/20 sm:h-24 sm:w-24 sm:text-7xl">
                    M
                  </span>
                  <span className="fonte-flow text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
                    <span className="text-white">Meet</span>
                    <span className="texto-gradiente">Flow</span>
                  </span>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <span className="pulso-badge inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-slate-300 backdrop-blur">
                  Eventos que conectam, memórias que ficam
                </span>
              </Reveal>

              {/* Dica de rolagem */}
              <div className="mt-16 animate-bounce text-slate-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-7 w-7"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            <Reveal delay={100}>
              <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
                Onde cada <span className="texto-gradiente">evento</span> vira
                uma experiência
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
                Crie, organize e viva meus encontros do começo ao fim. Capa
                personalizada, chat, galeria de fotos, playlists e mapa — tudo
                num só lugar, com a cara do seu evento.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/signup"
                  className="botao-brilho inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                >
                  Começar agora
                </Link>
              </div>
            </Reveal>

            {/* Cards flutuantes */}
            <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {CARDS_HERO.map((card, index) => (
                <Reveal key={card.label} delay={index * 150}>
                  <div
                    className={`${card.classe} group rounded-3xl bg-gradient-to-br from-sky-500/70 to-violet-500/70 p-[1.5px] shadow-2xl shadow-black/50 transition duration-500 hover:-translate-y-2 hover:shadow-violet-500/30`}
                  >
                    <div className="relative overflow-hidden rounded-3xl bg-slate-900">
                      <img
                        src={card.img}
                        alt={card.label}
                        className="h-60 w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      {/* Escurece a base para o texto ficar legível */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                      <span className="absolute left-4 top-4 rounded-full bg-slate-950/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-white backdrop-blur">
                        {card.tipo}
                      </span>

                      <div className="absolute inset-x-0 bottom-0 p-5 text-left">
                        <p className="text-lg font-semibold text-white">
                          {card.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-300">
                          {card.data}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ===================== NÚMEROS ===================== */}
          <section className="mx-auto max-w-5xl px-6 pb-24">
            <Reveal>
              <div className="bloco-dinamico grid grid-cols-2 gap-6 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 backdrop-blur md:grid-cols-4">
                {[
                  { numero: "6+", texto: "Recursos por evento" },
                  { numero: "∞", texto: "Eventos que você cria" },
                  { numero: "100%", texto: "Personalizável" },
                  { numero: "1", texto: "App para tudo" },
                ].map((item) => (
                  <div key={item.texto} className="text-center">
                    <p className="texto-gradiente text-4xl font-semibold">
                      {item.numero}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">{item.texto}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ===================== FAIXA EM MOVIMENTO ===================== */}
          <section className="pb-24">
            <div className="marquee py-2">
              <div className="marquee-track">
                {[...CATEGORIAS, ...CATEGORIAS].map((categoria, index) => (
                  <span
                    key={`${categoria}-${index}`}
                    className="inline-flex items-center gap-3 whitespace-nowrap rounded-full border border-slate-800/70 bg-slate-900/60 px-6 py-2.5 text-sm font-medium text-slate-200 backdrop-blur"
                  >
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500" />
                    {categoria}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== RECURSOS ===================== */}
          <section id="recursos" className="mx-auto max-w-6xl px-6 pb-24">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">
                  O que o MeetFlow oferece
                </p>
                <h2 className="mt-3 text-4xl font-semibold text-white">
                  Tudo para o seu evento acontecer
                </h2>
                <p className="mt-4 text-slate-300">
                  Do convite à última foto: recursos pensados para deixar cada
                  encontro organizado e memorável.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {RECURSOS.map((recurso, index) => (
                <Reveal key={recurso.titulo} delay={index * 90}>
                  <div className="bloco-dinamico group h-full rounded-3xl border border-slate-800/70 bg-slate-900/70 p-7 shadow-xl shadow-black/20 backdrop-blur hover:-translate-y-2 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/30">
                    <div
                      className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${recurso.gradiente} shadow-lg shadow-fuchsia-500/20 transition duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.7"
                        stroke="currentColor"
                        className="h-6 w-6 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={recurso.icone}
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {recurso.titulo}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {recurso.descricao}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ===================== COMO FUNCIONA ===================== */}
          <section className="mx-auto max-w-6xl px-6 pb-24">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                  Simples assim
                </p>
                <h2 className="mt-3 text-4xl font-semibold text-white">
                  Como funciona
                </h2>
              </div>
            </Reveal>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {PASSOS.map((passo, index) => (
                <Reveal key={passo.numero} delay={index * 150}>
                  <div className="bloco-dinamico group relative h-full rounded-3xl border border-slate-800/70 bg-slate-900/70 p-8 backdrop-blur hover:-translate-y-2 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-violet-500/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 text-2xl font-bold text-white shadow-lg shadow-violet-500/20 transition duration-300 group-hover:scale-110">
                      {passo.numero}
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-white">
                      {passo.titulo}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {passo.descricao}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ===================== GALERIA (PINTEREST) ===================== */}
          <section className="mx-auto max-w-6xl px-6 pb-24">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">
                  Inspire-se
                </p>
                <h2 className="mt-3 text-4xl font-semibold text-white">
                  Ideias para o seu próximo evento
                </h2>
                <p className="mt-4 text-slate-300">
                  Shows, encontros, workshops, piqueniques — cada momento merece
                  ser registrado.
                </p>
              </div>
            </Reveal>

            <Reveal className="mt-14">
              <div className="masonry">
                {GALERIA.map((src, index) => (
                  <div
                    key={src}
                    className="group overflow-hidden rounded-2xl shadow-lg shadow-black/30 transition duration-500 hover:-translate-y-2 hover:shadow-violet-500/30"
                  >
                    <img
                      src={src}
                      alt={`Inspiração de evento ${index + 1}`}
                      loading="lazy"
                      className="w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ===================== CTA FINAL ===================== */}
          <section className="mx-auto max-w-5xl px-6 pb-24">
            <Reveal>
              <div className="rounded-[2rem] bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 p-0.5 shadow-2xl shadow-fuchsia-500/20">
                <div className="rounded-[1.9rem] bg-slate-950/95 px-8 py-16 text-center">
                  <h2 className="mx-auto max-w-2xl text-4xl font-semibold text-white sm:text-5xl">
                    Pronto para criar seu próximo{" "}
                    <span className="texto-gradiente">evento</span>?
                  </h2>
                  <p className="mx-auto mt-5 max-w-xl text-slate-300">
                    Comece agora, é rápido. Em poucos cliques seu evento está no
                    ar com a cara que você quiser.
                  </p>
                  <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                      to="/signup"
                      className="botao-brilho inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                    >
                      Criar minha conta
                    </Link>
                    <Link
                      to="/login"
                      className="botao-brilho group inline-flex items-center justify-center rounded-2xl border border-slate-700 px-8 py-4 text-sm font-semibold text-slate-100 transition duration-300 hover:scale-105 hover:border-fuchsia-500/60 hover:bg-slate-900 active:scale-95"
                    >
                      Login
                      <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
        </main>

        {/* ===================== RODAPÉ ===================== */}
        <footer className="border-t border-slate-800/70 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="fonte-flow flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-xl font-bold text-white shadow-md shadow-fuchsia-500/25">
                M
              </span>
              <span className="fonte-flow text-lg font-bold">
                <span className="text-white">Meet</span>
                <span className="texto-gradiente">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500">
              Feito para reunir pessoas. © 2026 MeetFlow
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
