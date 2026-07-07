import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Sempre que a rota (URL) muda, rola a página de volta para o topo.
// Assim, ao navegar entre páginas, o usuário sempre começa vendo o início.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
