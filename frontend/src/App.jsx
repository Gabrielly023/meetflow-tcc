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
import MinhasGalerias from "./pages/MinhasGalerias";
import MinhasPlaylists from "./pages/MinhasPlaylists";
import ScrollToTop from "./components/ScrollToTop";
import AppLayout from "./components/AppLayout";
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

        {/* Páginas internas: casca (Header + SideBar) única e persistente */}
        <Route element={<AppLayout />}>
          <Route path="/usuarios" element={<HomePage />} />
          <Route path="/galerias" element={<MinhasGalerias />} />
          <Route path="/playlists" element={<MinhasPlaylists />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/eventos/novo" element={<CriarEvento />} />
          <Route path="/eventos/:id" element={<EventoDetalhe />} />
          <Route path="/eventos/:id/editar" element={<EditarEvento />} />
          <Route path="/eventos/:id/galeria" element={<GaleriaEvento />} />
          <Route path="/eventos/:id/playlist" element={<PlaylistEvento />} />
        </Route>
        </Routes>
      </PlayerProvider>
    </Router>
  );
}

export default App;
