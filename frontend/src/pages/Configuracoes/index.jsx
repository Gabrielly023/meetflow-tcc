import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    caminho: "/configuracoes/conta",
    itens: [{ texto: "Nome e username", ancora: "nome-usuario" }, { texto: "E-mail e telefone", ancora: "email-telefone" }],
  },
  {
    titulo: "Notificações",
    descricao: "Controlar alertas de convite, chat, lembretes e novidades.",
    caminho: "/configuracoes/notificacoes",
    itens: [{ texto: "Mensagens novas", ancora: "mensagens-novas" }, { texto: "Convites e confirmações", ancora: "convites-confirmacoes" }, { texto: "Lembretes do evento", ancora: "lembretes-evento" }],
  },
  {
    titulo: "Privacidade e acesso",
    descricao: "Decidir quem vê seu perfil, seus eventos e suas atividades.",
    caminho: "/configuracoes/privacidade",
    itens: [{ texto: "Sessões ativas", ancora: "sessoes-ativas" }, { texto: "Visibilidade do perfil", ancora: "visibilidade-perfil" }, { texto: "Controle de acesso", ancora: "controle-acesso" }],
  },
  {
    titulo: "Aparência e idioma",
    descricao: "Ajustes visuais para deixar o app com a sua cara.",
    caminho: "/configuracoes/aparencia",
    itens: [{ texto: "Tema escuro/claro", ancora: "tema-aparencia" }, { texto: "Idioma", ancora: "idioma-regiao" }, { texto: "Tamanho dos textos", ancora: "tamanho-texto" }],
  },
  {
    titulo: "Dados e backup",
    descricao: "Ferramentas para exportar e preservar o que você criou.",
    caminho: "/configuracoes/dados",
    itens: [{ texto: "Exportar dados", ancora: "exportar-dados" }, { texto: "Backup local", ancora: "backup-local" }, { texto: "Histórico do app", ancora: "historico-app" }],
  },
];

function Bloco({ titulo, descricao, itens, caminho }) {
  return (
    <section className="settings-overview-card hover-degrade group relative rounded-3xl border-2 border-slate-800/70 bg-gradient-to-br from-violet-500/15 to-sky-500/15 p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1">
      <Link
        to={caminho}
        aria-label={`Abrir ${titulo}`}
        className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      />
      <span aria-hidden="true" className="pointer-events-none absolute right-6 top-6 z-20 text-fuchsia-400 transition group-hover:translate-x-1">
        →
      </span>
      <div className="pointer-events-none text-center">
        <h2 className="text-xl font-semibold text-white">{titulo}</h2>
        <p className="mt-2 text-sm text-slate-400">{descricao}</p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {itens.map((item) => (
          <Link
            key={item.texto}
            to={`${caminho}#${item.ancora}`}
            className="relative z-20 inline-flex min-h-9 items-center rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-300 transition hover:border-fuchsia-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
          >
            {item.texto}
          </Link>
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
          <div className="settings-overview-intro">
            <p className="texto-gradiente-2 text-sm font-semibold uppercase tracking-[0.3em]">
              Configurações
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Ajustes da sua <span className="texto-gradiente">conta</span>
            </h1>
            <p className="mt-2 w-full max-w-none text-center text-slate-400">
              Gerencie suas informações e personalize sua experiência no
              MeetFlow.
            </p>
          </div>

          <div className="settings-account-summary borda-degrade-fixa group flex flex-col gap-5 rounded-3xl p-5 text-left shadow-xl shadow-violet-500/20 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 p-[1.5px] shadow-lg shadow-violet-500/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-slate-950/95 text-2xl font-semibold text-white">
                  {usuario?.foto_perfil ? (
                    <img
                      src={usuario.foto_perfil}
                      alt={`Foto de perfil de ${usuario.username || usuario.nome || "usuário"}`}
                      className="h-full w-full rounded-[14px] object-cover"
                    />
                  ) : (
                    (
                      (usuario?.username || usuario?.nome || "M")
                        .trim()
                        .charAt(0) || "M"
                    ).toUpperCase()
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Sua conta
                </p>
                <h2 className="mt-1 truncate text-2xl font-semibold text-white">
                  {usuario?.username || "Sem nome de usuário"}
                </h2>
                <p className="texto-nome-perfil mt-1 truncate text-base font-medium">
                  {usuario?.nome || "Nome não informado"}
                </p>
                <p className="mt-1 break-all text-sm text-slate-400">
                  {usuario?.email || "Sem e-mail cadastrado"}
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
              />
              Conta ativa
            </span>
          </div>
        </div>

        {erro && (
          <div className="rounded-2xl border border-red-500/40 bg-red-900/40 px-4 py-3 text-sm text-red-200">
            {erro}
          </div>
        )}

        <section className="settings-data-summary borda-degrade-fixa rounded-3xl p-5 shadow-xl shadow-violet-500/20 sm:p-6">
          <div className="mb-5 border-b border-slate-800/80 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-400">
              Conta e perfil
            </p>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-xl font-semibold text-white">Seus dados</h2>
              <p className="text-xs text-slate-500">
                Informações vinculadas à sua conta
              </p>
            </div>
          </div>
          <dl className="grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Nome", usuario?.nome],
              ["Nome de usuário", usuario?.username],
              ["E-mail", usuario?.email],
              ["Telefone", usuario?.telefone],
            ].map(([rotulo, valor]) => (
              <div
                key={rotulo}
                className="min-w-0 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 transition-colors hover:border-violet-500/30"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {rotulo}
                </dt>
                <dd className="mt-2 break-words text-sm font-medium text-slate-100">
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