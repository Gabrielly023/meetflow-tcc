import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import AuthField from "../../components/AuthField";
import { mensagemDoErro, solicitarRecuperacaoSenha, redefinirSenha } from "../../services/usuarioService";

const iconeEmail = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const iconeSenha = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const mascararEmail = (email) => {
  if (!email || !email.includes("@")) return "o e-mail cadastrado";

  const [local, dominio] = email.split("@");
  if (!dominio) return "o e-mail cadastrado";

  if (local.length <= 2) {
    return `${local[0] || ""}***@${dominio}`;
  }

  const visivel = local.slice(0, 2);
  const oculto = "*".repeat(Math.max(2, local.length - 2));
  return `${visivel}${oculto}@${dominio}`;
};

const RECUPERACAO_LOGIN_KEY = "meetflow.recuperacao.login";

const RecuperarSenha = () => {
  const location = useLocation();
  const loginInicial = (
    location.state?.login ||
    location.state?.email ||
    (typeof window !== "undefined" ? sessionStorage.getItem(RECUPERACAO_LOGIN_KEY) || "" : "") ||
    ""
  ).trim();

  const [email, setEmail] = useState(loginInicial.includes("@") ? loginInicial : "");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [etapa, setEtapa] = useState("senha");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleEnviarCodigo = async (e) => {
    e.preventDefault();

    if (!novaSenha || !confirmarSenha) {
      setError("Preencha a nova senha e a confirmação.");
      return;
    }

    if (novaSenha.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    const identificador = (
      loginInicial ||
      email ||
      (typeof window !== "undefined" ? sessionStorage.getItem(RECUPERACAO_LOGIN_KEY) || "" : "") ||
      ""
    ).trim();

    if (!identificador) {
      setError("Não foi possível identificar o usuário. Volte para a tela de login e tente novamente.");
      return;
    }

    setLoading(true);
    setError("");
    setSucesso("");

    try {
      const data = await solicitarRecuperacaoSenha(identificador);
      const emailReal = data.email || email || identificador;
      setEmail(emailReal);
      const emailMascarado = mascararEmail(emailReal);
      setSucesso(`Foi enviado um código para o e-mail cadastrado no seu usuário: ${emailMascarado}`);
      setEtapa("codigo");
      setLoading(false);
    } catch (err) {
      setError(mensagemDoErro(err, "Não foi possível enviar o código para o e-mail cadastrado."));
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSucesso("");

    try {
      const data = await redefinirSenha(email, codigo.trim(), novaSenha);
      setSucesso(data.mensagem || "Senha redefinida com sucesso!");
      setEtapa("sucesso");
    } catch (err) {
      setError(mensagemDoErro(err, "Não foi possível redefinir a senha."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      aviso="Lembrou da senha?"
      links={[{ label: "Voltar ao login", href: "/login" }]}
    >
      <div className="auth-card w-full max-w-md rounded-3xl bg-gradient-to-br from-orange-500/70 via-fuchsia-500/70 to-sky-500/70 p-[2px] shadow-2xl shadow-fuchsia-500/20">
        <div className="rounded-3xl bg-slate-900/80 p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <span className="fonte-flow mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-3xl font-bold text-white shadow-lg shadow-fuchsia-500/25">
              M
            </span>
            <h1 className="text-3xl font-semibold text-white">
              {etapa === "senha" ? "Nova senha" : etapa === "codigo" ? "Confirmar código" : "Senha redefinida"}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {etapa === "senha"
                ? "Defina sua nova senha e confirme abaixo."
                : etapa === "codigo"
                  ? "Digite o código enviado para o e-mail cadastrado no seu usuário."
                  : "Sua senha foi atualizada com sucesso."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-900/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {sucesso && (
            <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-900/40 px-4 py-3 text-sm text-emerald-200">
              {sucesso}
            </div>
          )}

          {etapa === "senha" && (
            <form onSubmit={handleEnviarCodigo} className="space-y-4">
              <AuthField
                id="nova-senha"
                label="Nova senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                icon={iconeSenha}
                required
              />

              <AuthField
                id="confirmar-senha"
                label="Confirmar senha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita sua nova senha"
                icon={iconeSenha}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </button>
            </form>
          )}

          {etapa === "codigo" && (
            <form onSubmit={handleRedefinirSenha} className="space-y-4">
              <AuthField
                id="codigo-recuperacao"
                label="Código recebido"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                icon={iconeSenha}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </button>
            </form>
          )}

          {etapa === "sucesso" && (
            <div className="mt-4 flex justify-center">
              <Link
                to="/login"
                className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95"
              >
                Voltar ao login
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default RecuperarSenha;
