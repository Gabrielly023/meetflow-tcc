import { Outlet } from "react-router-dom";
import Header from "../Header";
import SideBar from "../SideBar";

// Casca comum das páginas internas do app.
// Fica montada UMA vez (rota de layout), então Header e SideBar não são
// recriados ao navegar — é o que permite o player da sidebar seguir tocando.
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <div className="flex min-h-[calc(100vh-80px)]">
        <SideBar />
        <Outlet />
      </div>
    </div>
  );
}
