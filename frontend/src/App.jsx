import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UsuariosPage from "./pages/UsuariosPage";
import EventosPage from "./pages/EventosPage";
import CriarEvento from "./pages/CriarEvento";
import EditarEvento from "./pages/EditarEvento";
import EventoDetalhe from "./pages/EventoDetalhe";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/eventos/novo" element={<CriarEvento />} />
        <Route path="/eventos/:id" element={<EventoDetalhe />} />
        <Route path="/eventos/:id/editar" element={<EditarEvento />} />
      </Routes>
    </Router>
  );
}

export default App;
