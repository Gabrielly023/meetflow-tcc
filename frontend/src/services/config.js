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
  eventos: false, // CRUD de eventos
  playlists: false, // lista colaborativa de músicas do evento
  galeria: false, // fotos do evento
  chat: false, // mensagens do evento
};

// URL base do backend Express (a mesma usada em usuarioService.js).
export const API_URL = "http://localhost:3000";

// Onde guardamos o token JWT devolvido pelo login (POST /usuarios/login).
export const TOKEN_KEY = "meetflow.token";

// Instância única do Axios usada por todos os serviços de API.
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
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
