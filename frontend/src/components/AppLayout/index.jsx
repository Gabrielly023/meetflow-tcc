import { Outlet, useNavigate } from "react-router-dom";
import Header from "../Header";
import SideBar from "../SideBar";
import { getUsuarioLogado, logout } from "../../services/usuarioService";

// Casca comum das páginas internas do app.
// Fica montada UMA vez (rota de layout), então Header e SideBar não são
// recriados ao navegar — é o que permite o player da sidebar seguir tocando.
export default function AppLayout() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        links={[{ label: "Home", href: "/usuarios" }]}
        user={
          usuario
            ? { name: usuario.nome, foto_perfil: usuario.foto_perfil }
            : null
        }
        onLogout={handleLogout}
      />
      <div className="flex min-h-[calc(100vh-80px)]">
        <SideBar usuario={usuario} onLogout={handleLogout} />
        <Outlet />
      </div>
    </div>
  );
}
