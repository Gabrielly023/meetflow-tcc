import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import AuthField from "../../components/AuthField";
import GoogleButton from "../../components/GoogleButton";
import {
  cadastrar,
  entrarModoDemo,
  mensagemDoErro,
} from "../../services/usuarioService";

const iconeUsuario = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const iconeArroba = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 10-1.5 3.35M16.5 12V8.25m0 3.75v1.5a2.25 2.25 0 004.5 0V12a9 9 0 10-3.6 7.2" />
  </svg>
);

const iconeEmail = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const iconeTelefone = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const iconeSenha = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    username: "",
    email: "",
    telefone: "",
    senha: "",
    senhaConfirma: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogle = () => {
    // Cadastro social ainda não existe no backend: cria uma sessão de
    // demonstração local para navegar no app (ver entrarModoDemo).
    entrarModoDemo();
    navigate("/usuarios");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const username = formData.username.trim();
    // Telefone vai só com números para o backend (ex.: "11987654321").
    const telefoneNumeros = formData.telefone.replace(/\D/g, "");

    // username: sem espaços e sem caracteres especiais (só letras, números, . e _)
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      setError(
        "Nome de usuário inválido: use apenas letras, números, ponto (.) e underline (_), sem espaços.",
      );
      setLoading(false);
      return;
    }

    if (formData.senha !== formData.senhaConfirma) {
      setError("As senhas não correspondem.");
      setLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    if (telefoneNumeros.length < 10) {
      setError("Telefone inválido. Informe DDD + número (ex.: 11987654321).");
      setLoading(false);
      return;
    }

    try {
      await cadastrar({
        nome: formData.nome.trim(),
        username,
        email: formData.email.trim(),
        telefone: telefoneNumeros,
        senha: formData.senha,
      });

      setSuccess(
        "Cadastro realizado com sucesso! Redirecionando para login...",
      );
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(mensagemDoErro(err, "Erro ao fazer cadastro. Tente novamente."));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card w-full max-w-md rounded-3xl bg-gradient-to-br from-orange-500/70 via-fuchsia-500/70 to-sky-500/70 p-[2px] shadow-2xl shadow-fuchsia-500/20">
        <div className="rounded-3xl bg-slate-900/80 p-8 backdrop-blur-xl">
          {/* Cabeçalho */}
          <div className="mb-8 text-center">
            <span className="fonte-flow mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 text-3xl font-bold text-white shadow-lg shadow-fuchsia-500/25">
              M
            </span>
            <h1 className="text-3xl font-semibold text-white">Criar sua conta</h1>
            <p className="mt-2 text-sm text-slate-400">
              Comece a organizar eventos inesquecíveis.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-900/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-2xl border border-green-500/40 bg-green-900/40 px-4 py-3 text-sm text-green-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField
              id="nome"
              label="Nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
              icon={iconeUsuario}
              required
            />

            <AuthField
              id="username"
              label="Nome de usuário"
              value={formData.username}
              onChange={handleChange}
              placeholder="seu_usuario (único, sem espaços)"
              icon={iconeArroba}
              required
            />

            <AuthField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              icon={iconeEmail}
              required
            />

            <AuthField
              id="telefone"
              label="Telefone"
              type="tel"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 98765-4321"
              icon={iconeTelefone}
              required
            />

            <AuthField
              id="senha"
              label="Senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              icon={iconeSenha}
              required
            />

            <AuthField
              id="senhaConfirma"
              label="Confirmar Senha"
              type="password"
              value={formData.senhaConfirma}
              onChange={handleChange}
              placeholder="Repita sua senha"
              icon={iconeSenha}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-700/60" />
            <span className="text-xs uppercase tracking-widest text-slate-500">
              ou
            </span>
            <span className="h-px flex-1 bg-slate-700/60" />
          </div>

          <GoogleButton onClick={handleGoogle} texto="Cadastrar com o Google" />

          <p className="mt-6 text-center text-sm text-slate-400">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-fuchsia-400 transition hover:text-fuchsia-300"
            >
              Faça login
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

export default Signup;
