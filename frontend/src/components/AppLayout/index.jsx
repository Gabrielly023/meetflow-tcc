import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../Header";
import SideBar from "../SideBar";
import { getUsuarioLogado, logout } from "../../services/usuarioService";
import ModalConfirmacao from "../ModalConfirmacao";

// Casca comum das páginas internas do app.
// Fica montada UMA vez (rota de layout), então Header e SideBar não são
// recriados ao navegar — é o que permite o player da sidebar seguir tocando.
export default function AppLayout() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const [confirmarSair, setConfirmarSair] = useState(false);

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
      />
      <ModalConfirmacao
        aberto={confirmarSair}
        titulo="Tem certeza que deseja sair?"
        mensagem="Você será desconectado da sua conta e poderá entrar novamente quando quiser."
        textoConfirmar="Sair"
        perigo
        onConfirmar={handleLogout}
        onCancelar={() => setConfirmarSair(false)}
      />
      <div className="flex min-h-[calc(100vh-80px)]">
        <SideBar usuario={usuario} onLogout={() => setConfirmarSair(true)} />
        <Outlet />
      </div>
    </div>
  );
}
