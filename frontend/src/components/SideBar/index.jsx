import { Link } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";

const menuItems = [
  {
    title: "Criar Novo Evento",
    to: "/eventos/novo",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 8.25h18M4.5 4.5h15A1.5 1.5 0 0121 6v13.5A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V6a1.5 1.5 0 011.5-1.5z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v4.5M9.75 15h4.5" />
      </svg>
    ),
  },
  {
    title: "Eventos",
    to: "/eventos",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 8.25h18M4.5 4.5h15A1.5 1.5 0 0121 6v13.5A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V6a1.5 1.5 0 011.5-1.5z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h.01M12 12h.01M16.5 12h.01M7.5 15.75h.01M12 15.75h.01" />
      </svg>
    ),
  },
  {
    title: "Galeria/Seus Albuns",
    to: "/galerias",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
  {
    title: "Spotify/Suas Playlists",
    to: "/playlists",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
        />
      </svg>
    ),
  },
  {
    title: "Maps",
    to: "/mapas",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0z"
        />
      </svg>
    ),
  },
  {
    title: "Seus Grupos",
    href: "#",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  {
    title: "Configurações",
    href: "#",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const menuItemClass =
  "menu-item flex items-center justify-start gap-3 px-4 py-3 text-slate-200 rounded-2xl transition duration-300 hover:text-white hover:shadow-lg hover:shadow-violet-500/20";

export default function SideBar({ usuario, onLogout }) {
  const { registrarHost, aberto, fechar, origem } = usePlayer();
  const nomeUsuario = usuario?.nome || "Convidado";

  return (
    <aside className="sidebar-borda sidebar-scrollbar mt-6 flex w-64 shrink-0 flex-col self-stretch px-5 py-8">
      <Link to="/usuarios" className="inline-flex items-center gap-2">
        <span className="fonte-flow flex w-10 h-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-2xl font-bold text-white shadow-lg shadow-orange-500/20">
          M
        </span>
        <span className="fonte-flow text-lg font-bold">
          <span className="text-white">Meet</span>
          <span className="texto-gradiente">Flow</span>
        </span>
      </Link>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav className="flex-1 -mx-3 space-y-3">
          <div className="relative mx-3">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <input
              type="text"
              className="hover-degrade w-full py-2 pl-10 pr-4 text-slate-100 bg-slate-900 border-2 border-slate-700 rounded-xl placeholder:text-slate-500 transition duration-300 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25"
              placeholder="Search"
            />
          </div>

          {menuItems.map((item) =>
            item.to ? (
              <Link key={item.title} to={item.to} className={menuItemClass}>
                {item.icon}
                <span className="text-sm font-medium text-left">{item.title}</span>
              </Link>
            ) : (
              <a key={item.title} href={item.href} className={menuItemClass}>
                {item.icon}
                <span className="text-sm font-medium text-left">{item.title}</span>
              </a>
            )
          )}
        </nav>

        <div className="mt-6">
          {/* Player fixo do site: vive aqui na sidebar (que é um layout único),
              por isso continua tocando quando o usuário troca de página. */}
          {/* Borda em degradê azul→roxo: wrapper com o degradê + padding, e um
              interno arredondado por dentro (encaixa sem "quininhas" nos cantos) */}
          <div className="-mx-3 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 p-[2px] shadow-lg shadow-violet-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/40">
            <div className="overflow-hidden rounded-[10px] bg-slate-900">
            {/* Moldura fina: rótulo + de qual evento veio */}
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <div className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
                  Tocando agora
                </span>
                {origem && (
                  <span className="block truncate text-[11px] text-slate-400">
                    {origem}
                  </span>
                )}
              </div>
              {aberto && (
                <button
                  type="button"
                  onClick={fechar}
                  title="Fechar player"
                  className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Container do tamanho JÁ reduzido (200x253). O iframe é renderizado
                a 300px de largura (para o Spotify usar o layout vertical) e
                encolhido com scale — sem recarregar o player. */}
            <div
              className="relative mx-auto mb-2 overflow-hidden rounded-[14px] bg-slate-950/60"
              style={{ width: 236, height: 346 }}
            >
              {/* O React só gerencia esta div; o iframe do Spotify vive num filho solto */}
              <div
                ref={registrarHost}
                className="spotify-host"
                style={{
                  width: 300,
                  transform: "scale(0.787)",
                  transformOrigin: "top left",
                }}
              />
              {!aberto && (
                <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-sm text-slate-500">
                  Toque uma playlist ou música para ouvir aqui.
                </div>
              )}
            </div>
            </div>
          </div>

          <div className="-mx-2 mt-6 flex items-center justify-between rounded-2xl px-2 py-1.5 transition duration-300 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg hover:shadow-fuchsia-500/10">
            <Link to="/perfil" className="flex items-center gap-x-2">
              {usuario?.foto_perfil ? (
                <img
                  className="object-cover rounded-full h-7 w-7"
                  src={usuario.foto_perfil}
                  alt="avatar"
                />
              ) : (
                <span className="fonte-flow flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-xs font-bold text-white">
                  {nomeUsuario.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {nomeUsuario}
              </span>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              title="Sair"
              aria-label="Sair"
              className="text-gray-500 transition-colors duration-200 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
