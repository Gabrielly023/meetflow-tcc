import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import AuthLayout from "../../components/AuthLayout";
import AuthField from "../../components/AuthField";
import GoogleButton from "../../components/GoogleButton";
import {
  login as fazerLogin,
  salvarSessao,
  mensagemDoErro,
} from "../../services/usuarioService";

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

const Login = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fazerLogin(login.trim(), password);
      navigate("/usuarios");
    } catch (err) {
      setError(mensagemDoErro(err, "Erro ao realizar login. Tente novamente."));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      try {
        // 1. Pega os dados do Google
        const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await googleRes.json();

        // 2. Envia para o backend criar/autenticar
        const backRes = await fetch("http://localhost:3000/usuarios/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: googleUser.email,
            nome: googleUser.name,
            foto: googleUser.picture,
          }),
        });

        const data = await backRes.json();

        if (!backRes.ok) {
          throw new Error(data.mensagem || "Erro ao realizar login no servidor.");
        }

        // 3. Salva a sessão usando a função oficial da aplicação
        salvarSessao(data.usuario, data.token, data.refreshToken);

        // 4. Navega para o painel de usuários
        navigate("/usuarios");
      } catch (err) {
        console.error("Erro no fluxo do Google Login:", err);
        setError(err.message || "Não foi possível completar o login com o Google.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("A autenticação do Google foi cancelada ou falhou.");
    },
  });

  return (
    <AuthLayout
      aviso="Ainda não tem uma conta?"
      links={[{ label: "Cadastro", href: "/signup" }]}
    >
      <div className="auth-card w-full max-w-md rounded-3xl bg-gradient-to-br from-orange-500/70 via-fuchsia-500/70 to-sky-500/70 p-[2px] shadow-2xl shadow-fuchsia-500/20">
        <div className="rounded-3xl bg-slate-900/80 p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <span className="fonte-flow mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-3xl font-bold text-white shadow-lg shadow-fuchsia-500/25">
              M
            </span>
            <h1 className="text-3xl font-semibold text-white">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Entre para continuar organizando meus eventos.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-900/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField
              id="login"
              label="Email ou nome de usuário"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="seu@email.com ou seu_usuario"
              icon={iconeEmail}
              required
            />
            <AuthField
              id="password"
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              icon={iconeSenha}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-700/60" />
            <span className="text-xs uppercase tracking-widest text-slate-500">
              ou
            </span>
            <span className="h-px flex-1 bg-slate-700/60" />
          </div>

          <GoogleButton onClick={() => handleGoogle()} texto="Entrar com o Google" />

          <p className="mt-6 text-center text-sm text-slate-400">
            Não tem conta?{" "}
            <Link
              to="/signup"
              className="font-semibold text-fuchsia-400 transition hover:text-fuchsia-300"
            >
              Cadastre-se
            </Link>
          </p>
          <Link
            to="/"
            className="mt-4 block text-center text-sm text-slate-500 transition hover:text-slate-300"
          >
            ← Voltar para home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;