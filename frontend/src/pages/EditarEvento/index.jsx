import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import EventoForm from "../../components/EventoForm";
import {
  buscarEventoPorId,
  atualizarEvento,
  isDono,
} from "../../services/eventoService";

export default function EditarEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = buscarEventoPorId(id);

  // Evento inexistente OU usuário não é o dono → sem permissão de edição
  if (!evento || !isDono(evento)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-10">
          <div className="rounded-3xl border border-red-500/40 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/30">
            <h1 className="text-3xl font-semibold">
              {evento ? "Você não pode editar este evento" : "Evento não encontrado"}
            </h1>
            <p className="mt-4 text-slate-300">
              {evento
                ? "Apenas o organizador que criou o evento pode editá-lo."
                : "Verifique se o link está correto ou volte para a página de eventos."}
            </p>
            <Link
              to={evento ? `/eventos/${evento.id}` : "/eventos"}
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Voltar
            </Link>
          </div>
        </main>
      </div>
    );
  }

  function handleSalvar(dados) {
    atualizarEvento(evento.id, dados);
    navigate(`/eventos/${evento.id}`);
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
                  Editar evento
                </p>
                <h1 className="text-3xl font-semibold text-white">
                  {evento.titulo}
                </h1>
              </div>
              <Link
                to={`/eventos/${evento.id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-90"
              >
                Voltar ao evento
              </Link>
            </div>

            <EventoForm
              valorInicial={evento}
              onSubmit={handleSalvar}
              textoBotao="Salvar alterações"
              cancelarHref={`/eventos/${evento.id}`}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
