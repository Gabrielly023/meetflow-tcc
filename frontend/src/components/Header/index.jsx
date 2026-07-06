import { Link } from "react-router-dom";

// Degradê original da marca (mesmas cores e ordem de sempre)
const DEGRADE =
  "linear-gradient(to right,#fb923c 0%,#ec4899 25%,#f472b6 30%,#a855f7 60%,#60a5fa 70%,#38bdf8 85%,#22c55e 100%)";

const Header = ({
  title = "MeetFlow",
  links = [
    { label: "Home", href: "/" },
    { label: "Login", href: "/login" },
  ],
  user,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40">
      {/* Barra translúcida (glass), combinando com o fundo escuro do site */}
      <div className="border-b border-white/5 bg-slate-950/70 shadow-lg shadow-black/20 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-6 py-3.5">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <span className="fonte-flow flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-2xl font-bold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 group-hover:scale-105">
              M
            </span>
            <span className="fonte-flow text-xl font-bold text-white">
              {title}
            </span>
          </Link>

          {/* Navegação */}
          <nav className="ml-auto flex flex-wrap items-center justify-center gap-1">
            {links.map((link, index) => {
              const ehAcaoPrincipal = index === links.length - 1;
              return ehAcaoPrincipal ? (
                <Link
                  key={index}
                  to={link.href}
                  className="ml-1 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={index}
                  to={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition duration-200 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Usuário logado */}
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-200">
                {user.name}
              </span>
              <button
                onClick={onLogout}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Linha de destaque com a degradê da marca */}
      <div className="h-[3px] w-full" style={{ background: DEGRADE }} />
    </header>
  );
};

export default Header;
