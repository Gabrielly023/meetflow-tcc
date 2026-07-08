import { Navigate, useLocation } from "react-router-dom";
import { estaLogado } from "../../services/usuarioService";

// Guardião das rotas internas: se não houver ninguém logado (sem token),
// manda para a tela de login. Guarda de onde a pessoa veio (`from`) para,
// no futuro, dar para voltar à página que ela tentou acessar após logar.
export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!estaLogado()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
