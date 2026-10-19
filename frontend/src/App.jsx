import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import { PlayerProvider } from "./context/PlayerContext";
import {
  APARENCIA_PADRAO,
  aplicarPreferenciasAparencia,
  carregarPreferencias,
} from "./services/configuracoesService";

const InicialPage = lazy(() => import("./pages/InicialPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const RecuperarSenha = lazy(() => import("./pages/RecuperarSenha"));
const HomePage = lazy(() => import("./pages/HomePage"));
const EventosPage = lazy(() => import("./pages/EventosPage"));
const CriarEvento = lazy(() => import("./pages/CriarEvento"));
const EditarEvento = lazy(() => import("./pages/EditarEvento"));
const EventoDetalhe = lazy(() => import("./pages/EventoDetalhe"));
const GaleriaEvento = lazy(() => import("./pages/GaleriaEvento"));
const PlaylistEvento = lazy(() => import("./pages/PlaylistEvento"));
const MapaEvento = lazy(() => import("./pages/MapaEvento"));
const ChatEvento = lazy(() => import("./pages/ChatEvento"));
const GrupoEvento = lazy(() => import("./pages/GrupoEvento"));
const MinhasGalerias = lazy(() => import("./pages/MinhasGalerias"));
const MinhasPlaylists = lazy(() => import("./pages/MinhasPlaylists"));
const MapasGerais = lazy(() => import("./pages/MapasGerais"));
const MeusChats = lazy(() => import("./pages/MeusChats"));
const MeusContatos = lazy(() => import("./pages/MeusContatos"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Perfil = lazy(() => import("./pages/Perfil"));
const ConfiguracoesConta = lazy(() => import("./pages/ConfiguracoesConta"));
const ConfiguracoesNotificacoes = lazy(() => import("./pages/ConfiguracoesNotificacoes"));
const ConfiguracoesPrivacidade = lazy(() => import("./pages/ConfiguracoesPrivacidade"));
const ConfiguracoesAparencia = lazy(() => import("./pages/ConfiguracoesAparencia"));
const ConfiguracoesDados = lazy(() => import("./pages/ConfiguracoesDados"));


function App() {
  useEffect(() => {
    function atualizarAparencia() {
      try {
        aplicarPreferenciasAparencia(
          carregarPreferencias("aparencia", APARENCIA_PADRAO),
        );
      } catch (erro) {
        console.error("Não foi possível aplicar as preferências visuais:", erro);
        aplicarPreferenciasAparencia(APARENCIA_PADRAO);
      }
    }

    atualizarAparencia();
    window.addEventListener("meetflow:aparencia-atualizada", atualizarAparencia);
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", atualizarAparencia);
    return () => {
      window.removeEventListener("meetflow:aparencia-atualizada", atualizarAparencia);
      media.removeEventListener("change", atualizarAparencia);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <PlayerProvider>
        <Suspense fallback={<main role="status" className="flex min-h-64 flex-1 items-center justify-center text-sm text-slate-400">Carregando página…</main>}>
        <Routes>
        <Route path="/" element={<InicialPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />

        {/* Páginas internas: exigem login (RequireAuth) e compartilham a
            casca (Header + SideBar) única e persistente */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/usuarios" element={<HomePage />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/galerias" element={<MinhasGalerias />} />
          <Route path="/playlists" element={<MinhasPlaylists />} />
          <Route path="/mapas" element={<MapasGerais />} />
          <Route path="/chats" element={<MeusChats />} />
          <Route path="/contatos" element={<MeusContatos />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/configuracoes/conta" element={<ConfiguracoesConta />} />
          <Route path="/configuracoes/notificacoes" element={<ConfiguracoesNotificacoes />} />
          <Route path="/configuracoes/privacidade" element={<ConfiguracoesPrivacidade />} />
          <Route path="/configuracoes/aparencia" element={<ConfiguracoesAparencia />} />
          <Route path="/configuracoes/dados" element={<ConfiguracoesDados />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/eventos/novo" element={<CriarEvento />} />
          <Route path="/eventos/:id" element={<EventoDetalhe />} />
          <Route path="/eventos/:id/editar" element={<EditarEvento />} />
          <Route path="/eventos/:id/galeria" element={<GaleriaEvento />} />
          <Route path="/eventos/:id/playlist" element={<PlaylistEvento />} />
          <Route path="/eventos/:id/mapa" element={<MapaEvento />} />
          <Route path="/eventos/:id/chat" element={<ChatEvento />} />
          <Route path="/eventos/:id/grupo" element={<GrupoEvento />} />
        </Route>
        </Routes>
        </Suspense>
      </PlayerProvider>
    </Router>
  );
}

export default App;
