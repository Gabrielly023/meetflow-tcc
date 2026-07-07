import { useNavigate, Link } from "react-router-dom";
import EventoForm from "../../components/EventoForm";
import { criarEvento } from "../../services/eventoService";

export default function CriarEvento() {
  const navigate = useNavigate();

  function handleCriar(dados) {
    const novoEvento = criarEvento(dados);
    navigate(`/eventos/${novoEvento.id}`);
  }

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em]">
                  <span className="text-white">Novo </span>
                  <span className="texto-gradiente-2">evento</span>
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  Criar um <span className="texto-gradiente">evento</span>
                </h1>
              </div>
              <Link
                to="/eventos"
                className="group inline-flex items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:opacity-90 active:scale-95"
              >
                <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
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
  );
}
