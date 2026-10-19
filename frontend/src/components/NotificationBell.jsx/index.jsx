import { useState, useRef, useEffect } from "react";
import { socket } from "../../services/socket";
import { getUsuarioLogado } from "../../services/usuarioService";
import {
  buscarNotificacoesDoUsuario,
  responderSolicitacaoApi,
} from "../../services/notificacaoService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const dropdownRef = useRef(null);

  const usuarioAtual = getUsuarioLogado();
  const uid = usuarioAtual?.id_usuario || usuarioAtual?.id;

  // 1. Carrega notificações da API + Conecta ao Socket.io
  useEffect(() => {
    if (!uid) return;

    // Busca notificações salvas na tabela Chat
    buscarNotificacoesDoUsuario(uid).then((dados) => {
      if (Array.isArray(dados)) {
        setNotificacoes(dados);
      }
    });

    // Conecta ao Socket e entra no canal exclusivo do usuário (user_{uid})
    socket.connect();
    socket.emit("juntar_usuario", uid);

    // Ouve novos disparos em tempo real
    const aoReceberNotificacao = (novaNotificacao) => {
      setNotificacoes((prev) => [novaNotificacao, ...prev]);
    };

    socket.on("receber_notificacao", aoReceberNotificacao);

    return () => {
      socket.off("receber_notificacao", aoReceberNotificacao);
    };
  }, [uid]);

  // 2. Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  const responderSolicitacao = async (id, aprovado) => {
    const sucesso = await responderSolicitacaoApi(id, aprovado);
    if (sucesso) {
      // Remove localmente a notificação respondida
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sininho */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-900/80 text-slate-300 transition duration-300 hover:border-fuchsia-500/50 hover:text-white"
        title="Notificações"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {naoLidasCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 text-[10px] font-bold text-white shadow-lg shadow-fuchsia-500/40">
            {naoLidasCount > 9 ? "9+" : naoLidasCount}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-3xl border border-slate-700/70 bg-slate-900/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl sm:w-96">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-white">Notificações</h3>
            {naoLidasCount > 0 && (
              <span className="rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-xs font-medium text-fuchsia-300">
                {naoLidasCount} novas
              </span>
            )}
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {notificacoes.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Nenhuma notificação no momento.
              </p>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className="group relative rounded-2xl border border-slate-700/60 bg-slate-800/60 p-3 transition hover:border-fuchsia-500/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-xs font-bold text-white shadow-md shadow-fuchsia-500/20">
                      {n.usuario ? n.usuario[0].toUpperCase() : "M"}
                    </div>

                    <div className="flex-1 text-xs">
                      <p className="text-slate-200">
                        {n.mensagem}
                      </p>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {n.tempo || "Agora"}
                      </span>

                      {/* Botões de Ação para Convites ou Solicitações */}
                      {(n.tipo === "convite" || n.tipo === "pedido_entrada") && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => responderSolicitacao(n.id, true)}
                            className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/20 transition hover:opacity-90"
                          >
                            Aceitar
                          </button>
                          <button
                            type="button"
                            onClick={() => responderSolicitacao(n.id, false)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                          >
                            Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}