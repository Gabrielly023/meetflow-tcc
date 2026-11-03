import axios from "axios";

export const USE_API = {
  usuarios: true,
  eventos: true,
  playlists: false,
  galeria: true,
  chat: false,
  mapas: true,
  participantes: true,
};

export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export const TOKEN_KEY = "meetflow.token";
export const REFRESH_TOKEN_KEY = "meetflow.refreshToken";

export const api = axios.create({
  baseURL: API_URL,
  headers: {},
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Continua sem token se o localStorage não estiver disponível.
  }

  return config;
});