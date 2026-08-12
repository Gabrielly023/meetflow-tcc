import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalConfirmacao from "../../components/ModalConfirmacao";
import {
  atualizarUsuario,
  deletarUsuario,
  getUsuarioLogado,
  logout,
  mensagemDoErro,
  salvarSessao,
} from "../../services/usuarioService";
import { TOKEN_KEY } from "../../services/config";

const secoes = [
  {
    titulo: "Conta e perfil",
    descricao: "Editar nome, username, foto, bio e senha em um só lugar.",
    itens: ["Nome e username", "Foto de perfil", "Senha e segurança"],
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
    <section className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{titulo}</h2>
          <p className="mt-2 text-sm text-slate-400">{descricao}</p>
        </div>
        <span className="text-fuchsia-400 transition group-hover:translate-x-1">→</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
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
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const usuario = getUsuarioLogado();
  const [form, setForm] = useState({
    nome: usuario?.nome || "",
    username: usuario?.username || "",
    email: usuario?.email || "",
    telefone: usuario?.telefone || "",
  });
  const [prefs, setPrefs] = useState(() => {
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
    setForm({
      nome: usuario?.nome || "",
      username: usuario?.username || "",
      email: usuario?.email || "",
      telefone: usuario?.telefone || "",
    });
  }, [usuario]);

  useEffect(() => {
    try {
      localStorage.setItem("meetflow.config.prefs", JSON.stringify(prefs));
    } catch {
      // sem persistência local: segue normalmente
    }
  }, [prefs]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  function sairDaConta() {
    logout();
    navigate("/login");
  }

  async function salvarMudancasPerfil(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!usuario?.id_usuario) {
      setErro("Você precisa estar logado para salvar alterações.");
      return;
    }

    setSalvando(true);
    try {
      const atualizado = await atualizarUsuario(usuario.id_usuario, {
        nome: form.nome.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        telefone: (form.telefone || "").replace(/\D/g, ""),
      });
      salvarSessao(atualizado, localStorage.getItem(TOKEN_KEY));
      setSucesso("Alterações salvas com sucesso.");
    } catch (err) {
      setErro(mensagemDoErro(err, "Não foi possível salvar as alterações."));
    } finally {
      setSalvando(false);
    }
  }

  async function excluirConta() {
    setErro("");
    setSucesso("");

    if (!usuario?.id_usuario) {
      setErro("Não foi possível identificar sua conta.");
      return;
    }

    setSalvando(true);
    try {
      await deletarUsuario(usuario.id_usuario);
      logout();
      navigate("/login");
    } catch (err) {
      setErro(mensagemDoErro(err, "Não foi possível excluir a conta."));
    } finally {
      setSalvando(false);
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

          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
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

        {sucesso && (
          <div className="rounded-2xl border border-green-500/40 bg-green-900/40 px-4 py-3 text-sm text-green-200">
            {sucesso}
          </div>
        )}

        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-400">
                Conta e perfil
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Editar dados principais
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Agora este bloco salva nome, username, e-mail e telefone no servidor.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300">
              Atualização real
            </span>
          </div>

          <form onSubmit={salvarMudancasPerfil} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-200">Nome</span>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-200">Nome de usuário</span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-200">E-mail</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-200">Telefone</span>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25"
              />
            </label>

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
              <p className="text-sm text-slate-400">
                Essas informações vão para o backend e também atualizam sua sessão.
              </p>
            </div>
          </form>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {secoes.map((secao) => (
            <Bloco key={secao.titulo} {...secao} />
          ))}
        </div>

        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
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

        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
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