import axios from "axios";

// ────────────────────────────────────────────────────────────────────────
// INTERRUPTOR: backend real  ×  "backend falso" (localStorage)
//
// Cada entidade tem sua própria flag. Enquanto a rota real não existir no
// backend, deixe `false`: o app continua funcionando pelo localStorage,
// exatamente como hoje. Quando a dupla do backend entregar as rotas de uma
// entidade, vire a flag dela para `true` e teste. Nada mais precisa mudar
// na camada de serviços.
//
// ⚠️ CUIDADO ao virar uma flag para `true`:
//   As funções do localStorage são SÍNCRONAS (retornam o dado direto).
//   As funções da API são ASSÍNCRONAS (retornam Promise). Então, ao ligar
//   uma entidade, as PÁGINAS que a consomem precisam passar a usar
//   async/await (ex.: carregar dentro de um useEffect). Veja o guia em
//   services/README.md.
// ────────────────────────────────────────────────────────────────────────
export const USE_API = {
  usuarios: true, // já tem backend real (/usuarios): cadastro e login
  eventos: true, // CRUD de eventos
  playlists: false, // playlist do evento + lista colaborativa de músicas
  galeria: true, // fotos do evento
  chat: false, // mensagens do evento
  mapas: true, // locais (Google Maps) do evento
};

// URL base do backend Express (a mesma usada em usuarioService.js).
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
if (!API_URL) throw new Error("Configure VITE_API_URL no ambiente do frontend.");

// Onde guardamos o token JWT devolvido pelo login (POST /usuarios/login).
export const TOKEN_KEY = "meetflow.token";
export const REFRESH_TOKEN_KEY = "meetflow.refreshToken";

// Instância única do Axios usada por todos os serviços de API.
export const api = axios.create({
  baseURL: API_URL,
  headers: {},
  withCredentials: true,
});

// Anexa automaticamente o token JWT (se houver) em toda requisição,
// para as rotas protegidas saberem quem é o usuário logado.
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // sem localStorage disponível: segue sem token
  }
  return config;
});

let refreshPromise;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      request.url?.includes("/usuarios/refresh-token")
    ) {
      return Promise.reject(error);
    }

    let refreshToken;
    try {
      refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return Promise.reject(error);
    }
    if (!refreshToken) return Promise.reject(error);

    request._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_URL}/usuarios/refresh-token`, { refreshToken })
          .then(({ data }) => {
            localStorage.setItem(TOKEN_KEY, data.token);
            return data.token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const token = await refreshPromise;
      request.headers.Authorization = `Bearer ${token}`;
      return api(request);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
