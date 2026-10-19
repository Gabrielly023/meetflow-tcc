import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalConfirmacao from "../../components/ModalConfirmacao";
import {
  deletarUsuario,
  getUsuarioLogado,
  logout,
  mensagemDoErro,
} from "../../services/usuarioService";

const secoes = [
  {
    titulo: "Conta e perfil",
    descricao: "Consultar as principais informações da sua conta.",
    itens: ["Nome e username", "E-mail e telefone"],
  },
  {
    titulo: "Notificações",
    descricao: "Controlar alertas de convite, chat, lembretes e novidades.",
    itens: ["Mensagens novas", "Convites e confirmações", "Lembretes do evento"],
  },
  {
    titulo: "Privacidade e acesso",
    descricao: "Decidir quem vê seu perfil, seus eventos e suas atividades.",
    itens: ["Sessões ativas", "Visibilidade do perfil", "Controle de acesso"],
  },
  {
    titulo: "Aparência e idioma",
    descricao: "Ajustes visuais para deixar o app com a sua cara.",
    itens: ["Tema escuro/claro", "Idioma", "Tamanho dos textos"],
  },
  {
    titulo: "Dados e backup",
    descricao: "Ferramentas para exportar e preservar o que você criou.",
    itens: ["Exportar dados", "Backup local", "Histórico do app"],
  },
];

function Bloco({ titulo, descricao, itens }) {
  return (
    <section className="hover-degrade group relative rounded-3xl border-2 border-slate-800/70 bg-gradient-to-br from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1">
      <span className="absolute right-6 top-6 text-fuchsia-400 transition group-hover:translate-x-1">
        →
      </span>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">{titulo}</h2>
        <p className="mt-2 text-sm text-slate-400">{descricao}</p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {itens.map((item) => (
          <span
            key={item}
            className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1.5 text-xs text-slate-300"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function Configuracoes() {
  const navigate = useNavigate();
  const [confirmarSair, setConfirmarSair] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erro, setErro] = useState("");
  const usuario = getUsuarioLogado();
  const [prefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("meetflow.config.prefs")) || {
        notificacoesChat: true,
        notificacoesConvites: true,
        tema: "escuro",
      };
    } catch {
      return {
        notificacoesChat: true,
        notificacoesConvites: true,
        tema: "escuro",
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("meetflow.config.prefs", JSON.stringify(prefs));
    } catch {
      // sem persistência local: segue normalmente
    }
  }, [prefs]);

  function sairDaConta() {
    logout();
    navigate("/login");
  }

  async function excluirConta() {
    setErro("");

    if (!usuario?.id_usuario) {
      setErro("Não foi possível identificar sua conta.");
      return;
    }

    try {
      await deletarUsuario(usuario.id_usuario);
      logout();
      navigate("/login");
    } catch (err) {
      setErro(mensagemDoErro(err, "Não foi possível excluir a conta."));
    } finally {
      setConfirmarExclusao(false);
    }
  }

  return (
    <main className="flex-1 px-6 py-8 lg:px-10">
      <ModalConfirmacao
        aberto={confirmarSair}
        titulo="Tem certeza que deseja sair?"
        mensagem="Você será desconectado da sua conta e poderá entrar novamente quando quiser."
        textoConfirmar="Sair"
        perigo
        onConfirmar={sairDaConta}
        onCancelar={() => setConfirmarSair(false)}
      />

      <ModalConfirmacao
        aberto={confirmarExclusao}
        titulo="Tem certeza que deseja excluir sua conta?"
        mensagem="Essa ação remove sua conta do sistema e não pode ser desfeita."
        textoConfirmar="Excluir conta"
        perigo
        onConfirmar={excluirConta}
        onCancelar={() => setConfirmarExclusao(false)}
      />

      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 text-center">
          <div>
            <p className="texto-gradiente-2 text-sm font-semibold uppercase tracking-[0.3em]">
              Configurações
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Ajustes da sua <span className="texto-gradiente">conta</span>
            </h1>
            <p className="mt-2 text-slate-400">
              Aqui entram os controles que hoje estão vazios: perfil, alertas,
              privacidade, tema e seus dados.
            </p>
          </div>

          <div className="hover-degrade rounded-3xl border-2 border-slate-800/70 bg-slate-900/80 p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-400">
              Conta ativa
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {usuario?.nome || "Convidado"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {usuario?.email || "Sem e-mail cadastrado"}
            </p>
          </div>
        </div>

        {erro && (
          <div className="rounded-2xl border border-red-500/40 bg-red-900/40 px-4 py-3 text-sm text-red-200">
            {erro}
          </div>
        )}

        <section className="hover-degrade rounded-3xl border-2 border-slate-800/70 bg-slate-900/80 p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-400">
              Conta e perfil
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Seus dados
            </h2>
          </div>
          <dl className="grid gap-x-6 gap-y-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Nome", usuario?.nome],
              ["Nome de usuário", usuario?.username],
              ["E-mail", usuario?.email],
              ["Telefone", usuario?.telefone],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">{rotulo}</dt>
                <dd className="mt-1 truncate text-sm text-slate-100">
                  {valor || "Não informado"}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {secoes.map((secao) => (
            <Bloco key={secao.titulo} {...secao} />
          ))}
        </div>

        <section className="hover-degrade rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-300">
                Encerrar sessão
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Sair da conta
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                A saída principal continua sendo o botão grande da sidebar.
                Esta opção fica dentro de Configurações, como pedido.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setConfirmarSair(true)}
              className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95"
            >
              Sair da conta
            </button>
          </div>
        </section>

        <section className="hover-degrade rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-300">
                Exclusão de conta
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Excluir conta
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Remove definitivamente sua conta do banco de dados.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setConfirmarExclusao(true)}
              className="rounded-2xl border border-red-400/40 bg-red-500/20 px-5 py-3 text-sm font-semibold text-red-100 transition duration-300 hover:bg-red-500/30"
            >
              Excluir conta
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}