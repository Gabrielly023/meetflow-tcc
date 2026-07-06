import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import EventoForm from "../../components/EventoForm";
import { criarEvento } from "../../services/eventoService";

export default function CriarEvento() {
  const navigate = useNavigate();

  function handleCriar(dados) {
    const novoEvento = criarEvento(dados);
    navigate(`/eventos/${novoEvento.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <div className="flex min-h-[calc(100vh-80px)]">
        <SideBar />
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">
                  Novo evento
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  Criar um evento
                </h1>
              </div>
              <Link
                to="/eventos"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-90"
              >
                Voltar aos eventos
              </Link>
            </div>

            <EventoForm
              onSubmit={handleCriar}
              textoBotao="Criar evento"
              cancelarHref="/eventos"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
