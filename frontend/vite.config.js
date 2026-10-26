import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (command === "build") {
    let api;
    try { api = new URL(env.VITE_API_URL); } catch {
      throw new Error("Preencha VITE_API_URL em .env.production com a origem da API.");
    }
    if (api.protocol !== "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(api.hostname) || api.pathname !== "/" || api.search || api.hash || api.username || api.password) {
      throw new Error("VITE_API_URL de producao deve ser uma origem HTTPS publica, sem caminho ou credenciais.");
    }
    if (!env.VITE_GOOGLE_CLIENT_ID) throw new Error("Preencha VITE_GOOGLE_CLIENT_ID.");
  }
  return {
  base: "/tecti/2026/gpec12/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  };
});
