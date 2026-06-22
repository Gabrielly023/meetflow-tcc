import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validações
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

    if (formData.telefone.length < 10) {
      setError("Telefone inválido.");
      setLoading(false);
      return;
    }

    try {
      // TODO: Adicionar chamada à API do backend
      console.log("Cadastro com:", {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        senha: formData.senha,
      });

      // const response = await fetch("/api/cadastro", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     nome: formData.nome,
      //     email: formData.email,
      //     telefone: formData.telefone,
      //     senha: formData.senha,
      //   }),
      // });

      // if (response.ok) {
      //   setSuccess("Cadastro realizado com sucesso! Redirecionando para login...");
      //   setTimeout(() => navigate("/login"), 2000);
      // } else {
      //   setError("Erro ao fazer cadastro. Tente novamente.");
      // }

      setSuccess(
        "Cadastro realizado com sucesso! Redirecionando para login...",
      );
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Erro ao fazer cadastro. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 w-full min-h-screen">
      <Header />
      <main className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-8">
        <div
          className="w-full max-w-md p-1 rounded-2xl"
          style={{
            background:
              "linear-gradient(90deg, #fb923c 0%, #ec4899 25%, #f472b6 40%, #a855f7 60%, #60a5fa 75%, #38bdf8 85%, #22c55e 100%)",
          }}
        >
          <div
            className="bg-slate-900 rounded-xl shadow-lg p-8"
            style={{ border: "2px solid rgba(255,255,255,0.03)" }}
          >
            <h1 className="text-3xl font-bold text-white mb-6 text-center">
              Cadastro
            </h1>

            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-white mb-2 font-medium"
                >
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded focus:outline-none focus:border-violet-500 transition"
                  placeholder="Seu nome completo"
                />
              </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded focus:outline-none focus:border-violet-500 transition"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="telefone"
                  className="block text-white mb-2 font-medium"
                >
                  Telefone
                </label>
                <input
                  id="telefone"
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded focus:outline-none focus:border-violet-500 transition"
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div>
                <label
                  htmlFor="senha"
                  className="block text-white mb-2 font-medium"
                >
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded focus:outline-none focus:border-violet-500 transition"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label
                  htmlFor="senhaConfirma"
                  className="block text-white mb-2 font-medium"
                >
                  Confirmar Senha
                </label>
                <input
                  id="senhaConfirma"
                  type="password"
                  name="senhaConfirma"
                  value={formData.senhaConfirma}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded focus:outline-none focus:border-violet-500 transition"
                  placeholder="Repita sua senha"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-400 to-violet-500 text-white font-semibold py-2 rounded hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-400">
                Já tem conta?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-violet-400 hover:text-violet-300 transition"
                >
                  Faça login
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
        </div>
      </main>
    </div>
  );
};

export default Signup;
