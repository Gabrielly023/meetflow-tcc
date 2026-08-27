import { api, TOKEN_KEY } from "./config";

// Serviço de usuários: cadastro, login, sessão (token JWT) e CRUD.
// Usa a instância compartilhada do Axios (config.js), que já anexa o token
// automaticamente nas requisições. Rotas: ver CONTRATO_API_FRONTEND.md.

// Onde guardamos o usuário logado (o token fica em TOKEN_KEY, ver config.js).
const USUARIO_KEY = "meetflow.usuario";

// Extrai a mensagem de erro que o backend envia ({ mensagem: "..." }),
// caindo para um texto padrão se não houver resposta (ex.: backend offline).
export function mensagemDoErro(erro, padrao = "Algo deu errado. Tente novamente.") {
  return erro?.response?.data?.mensagem || padrao;
}

// ─────────────────────── SESSÃO (token + usuário) ───────────────────────

// Guarda o token JWT e o usuário logado no localStorage.
export function salvarSessao(usuario, token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (usuario) localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  } catch (erro) {
    console.error("Erro ao salvar a sessão:", erro);
  }
}

// Retorna o usuário logado (ou null se não houver).
export function getUsuarioLogado() {
  try {
    const bruto = localStorage.getItem(USUARIO_KEY);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

// Diz se há alguém logado (existe token guardado).
export function estaLogado() {
  try {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

// Diz se a sessão atual é a de demonstração (botão "Entrar com Google" offline).
export function ehModoDemo() {
  try {
    return localStorage.getItem(TOKEN_KEY) === "demo";
  } catch {
    return false;
  }
}

// Encerra a sessão: remove token e usuário.
export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  } catch {
    // sem localStorage: nada a fazer
  }
}

// ─────────────────────── CADASTRO E LOGIN ───────────────────────

// POST /usuarios — cadastro.
// `dados`: { nome, username, email, telefone, senha }
export const cadastrar = async (dados) => {
  const { data } = await api.post("/usuarios/cadastrar", dados);
  return data; // { mensagem, usuario }
};

// POST /usuarios/login — `login` pode ser o email OU o username.
// Em caso de sucesso, já guarda o token e o usuário na sessão.
export const login = async (loginOuEmail, senha) => {
  const { data } = await api.post("/usuarios/login", {
    login: loginOuEmail,
    senha,
  });
  salvarSessao(data.usuario, data.token);
  return data; // { mensagem, usuario, token }
};

// Sessão de DEMONSTRAÇÃO (sem backend): usada pelos botões "Entrar com Google"
// enquanto o login social não existe. Permite navegar no app offline (a parte
// de eventos/galeria/playlist roda em localStorage). Quando houver login real
// com Google, é só trocar isto por uma chamada de verdade ao backend.
export function entrarModoDemo() {
  salvarSessao(
    { nome: "Convidado", username: "convidado", email: "", telefone: "" },
    "demo",
  );
}

// ─────────────────────── CRUD (usado no futuro) ───────────────────────

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
