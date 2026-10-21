import { api, TOKEN_KEY } from "./config";

// Chaves usadas no localStorage
const USUARIO_KEY = "meetflow.usuario";
const REFRESH_TOKEN_KEY = "meetflow.refreshToken"; // ➕ NOVA CHAVE ADICIONADA
export const EVENTO_SESSAO_ATUALIZADA = "meetflow:sessao-atualizada";

// Extrai a mensagem de erro que o backend envia
export function mensagemDoErro(erro, padrao = "Algo deu errado. Tente novamente.") {
  return erro?.response?.data?.mensagem || padrao;
}

// ─────────────────────── SESSÃO (token + usuário) ───────────────────────

// Guarda o Access Token, Refresh Token e o Usuário no localStorage
export function salvarSessao(usuario, token, refreshToken) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken); // ➕ SALVA REFRESH TOKEN
    if (usuario) localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(EVENTO_SESSAO_ATUALIZADA));
    }
  } catch (erro) {
    console.error("Erro ao salvar a sessão:", erro);
  }
}

// Retorna o Refresh Token salvo
export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

// Retorna o usuário logado (ou null se não houver)
export function getUsuarioLogado() {
  try {
    const bruto = localStorage.getItem(USUARIO_KEY);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

// Diz se há alguém logado (existe token guardado)
export function estaLogado() {
  try {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

// Diz se a sessão atual é a de demonstração
export function ehModoDemo() {
  try {
    return localStorage.getItem(TOKEN_KEY) === "demo";
  } catch {
    return false;
  }
}

// Encerra a sessão: remove tokens e usuário
export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY); // ➕ LIMPA O REFRESH TOKEN
    localStorage.removeItem(USUARIO_KEY);
  } catch {
    // sem localStorage: nada a fazer
  }
}

// ─────────────────────── CADASTRO, LOGIN E RENOVAÇÃO ───────────────────────

// POST /usuarios/cadastrar — cadastro
export const cadastrar = async (dados) => {
  const { data } = await api.post("/usuarios/cadastrar", dados);
  return data; // { mensagem, usuario }
};

// POST /usuarios/login — login
export const login = async (loginOuEmail, senha) => {
  const { data } = await api.post("/usuarios/login", {
    login: loginOuEmail,
    senha,
  });
  
  // ➕ Passa o refreshToken para a função salvarSessao
  salvarSessao(data.usuario, data.token, data.refreshToken);
  return data; // { mensagem, usuario, token, refreshToken }
};

// ➕ NOVA FUNÇÃO: Renova o Access Token expirado usando o Refresh Token
export const renovarSessao = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Sem refresh token disponível");

  const { data } = await api.post("/usuarios/refresh-token", { refreshToken });
  
  // Atualiza o novo Access Token no localStorage
  if (data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data; // { mensagem, token }
};

// Sessão de DEMONSTRAÇÃO (offline)
export function entrarModoDemo() {
  salvarSessao(
    { nome: "Convidado", username: "convidado", email: "", telefone: "" },
    "demo",
    "demo"
  );
}

// ─────────────────────── CRUD ───────────────────────

export const listarUsuarios = async () => {
  const { data } = await api.get("/usuarios");
  return data;
};

export const buscarUsuarioPorId = async (id) => {
  const { data } = await api.get(`/usuarios/${id}`);
  return data;
};

export const atualizarUsuario = async (id, dados) => {
  const { data } = await api.put(`/usuarios/${id}`, dados);
  return data;
};

export const deletarUsuario = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}`);
  return data;
};

export default api;