import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InicialPage from "./pages/InicialPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/HomePage";
import EventosPage from "./pages/EventosPage";
import CriarEvento from "./pages/CriarEvento";
import EditarEvento from "./pages/EditarEvento";
import EventoDetalhe from "./pages/EventoDetalhe";
import GaleriaEvento from "./pages/GaleriaEvento";
import PlaylistEvento from "./pages/PlaylistEvento";
import MapaEvento from "./pages/MapaEvento";
import MinhasGalerias from "./pages/MinhasGalerias";
import MinhasPlaylists from "./pages/MinhasPlaylists";
import MapasGerais from "./pages/MapasGerais";
import Perfil from "./pages/Perfil";
import ScrollToTop from "./components/ScrollToTop";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import { PlayerProvider } from "./context/PlayerContext";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <PlayerProvider>
        <Routes>
        <Route path="/" element={<InicialPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/eventos/novo" element={<CriarEvento />} />
          <Route path="/eventos/:id" element={<EventoDetalhe />} />
          <Route path="/eventos/:id/editar" element={<EditarEvento />} />
          <Route path="/eventos/:id/galeria" element={<GaleriaEvento />} />
          <Route path="/eventos/:id/playlist" element={<PlaylistEvento />} />
          <Route path="/eventos/:id/mapa" element={<MapaEvento />} />
        </Route>
        </Routes>
      </PlayerProvider>
    </Router>
  );
}

export default App;
