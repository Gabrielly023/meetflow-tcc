import { Link } from "react-router-dom";

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
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 21.75h9a3 3 0 003-3V7.5a3 3 0 00-3-3h-9a3 3 0 00-3 3v11.25a3 3 0 003 3z"
        />
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5h7.5M8.25 12h7.5M8.25 16.5h7.5" />
        <rect
          x="3.75"
          y="3.75"
          width="16.5"
          height="16.5"
          rx="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Galeria/Seus Albuns",
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
        <rect
          x="3.75"
          y="5.25"
          width="16.5"
          height="13.5"
          rx="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3.75 8.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 12.75l2.25 2.25 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Spotify/Suas Playlists",
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19.5l6-6-6-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15" />
      </svg>
    ),
  },
  {
    title: "Maps",
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 5.25h10.5M7.5 8.25h9M8.25 11.25h7.5M10.5 14.25h3" />
        <path
          d="M18.375 21.75H5.625a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25h12.75a2.25 2.25 0 012.25 2.25v12.75a2.25 2.25 0 01-2.25 2.25z"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5a7.5 7.5 0 0115 0" />
      </svg>
    ),
  },
  {
    title: "Configura��es",
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
          d="M11.25 3.75h1.5M12 6.75v1.5M16.5 12h1.5M6 12H7.5M16.5 17.25l1.06 1.06M6.94 6.94L8 8M7.5 17.25l-1.06 1.06M15.06 6.94L14 8"
        />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const menuItemClass =
  "flex items-center justify-start gap-3 px-4 py-3 text-slate-200 transition duration-300 transform rounded-2xl hover:bg-slate-800 hover:text-white";

export default function SideBar() {
  return (
    <aside className="sidebar-scrollbar flex flex-col w-64 h-screen px-5 py-8 overflow-y-auto bg-slate-950 border-r border-slate-800">
      <Link to="/" className="inline-flex items-center gap-2">
        <span className="fonte-flow flex w-10 h-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-2xl font-bold text-white shadow-lg shadow-orange-500/20">
          M
        </span>
        <span className="text-white text-lg font-semibold">MeetFlow</span>
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
              className="w-full py-2 pl-10 pr-4 text-slate-100 bg-slate-900 border border-slate-700 rounded-xl placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25"
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
          <div className="p-3 bg-gray-100 rounded-lg dark:bg-gray-800">
            <h2 className="text-sm font-medium text-gray-800 dark:text-white">New feature available!</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus harum officia eligendi velit.
            </p>
            <img
              className="object-cover w-full h-32 mt-2 rounded-lg"
              src="https://images.unsplash.com/photo-1658953229664-e8d5ebd039ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&h=1374&q=80"
              alt="feature preview"
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <Link to="/perfil" className="flex items-center gap-x-2">
              <img
                className="object-cover rounded-full h-7 w-7"
                src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&h=634&q=80"
                alt="avatar"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">John Doe</span>
            </Link>
            <button className="text-gray-500 transition-colors duration-200 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
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
        </div>
      </div>
    </aside>
  );
}
