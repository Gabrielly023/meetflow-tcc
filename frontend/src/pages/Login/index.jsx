import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Adicionar chamada à API do backend
      console.log("Login com:", { email, password });
      // const response = await fetch("/api/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });
      // if (response.ok) {
      //   navigate("/");
      // }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 w-full min-h-screen">
      <Header />
      <main className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md bg-slate-900 rounded-lg shadow-lg p-8 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Login
          </h1>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-white mb-2 font-medium"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded focus:outline-none focus:border-violet-500 transition"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-white mb-2 font-medium"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded focus:outline-none focus:border-violet-500 transition"
                placeholder="Sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-violet-500 text-white font-semibold py-2 rounded hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-400">
              Não tem conta?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-violet-400 hover:text-violet-300 transition"
              >
                Cadastre-se
              </button>
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full mt-4 text-gray-400 hover:text-white transition"
          >
            ← Voltar para home
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
