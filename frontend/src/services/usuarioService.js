import axios from "axios";

// URL base do backend
const API_URL = "http://localhost:3000";

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// GET - Listar todos os usuários
export const listarUsuarios = async () => {
  try {
    const response = await api.get("/usuarios");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    throw error;
  }
};

// GET - Buscar usuário por ID
export const buscarUsuarioPorId = async (id) => {
  try {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar usuário ${id}:`, error);
    throw error;
  }
};

// POST - Criar novo usuário
export const criarUsuario = async (dados) => {
  try {
    const response = await api.post("/usuarios", dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
};

// PUT - Atualizar usuário
export const atualizarUsuario = async (id, dados) => {
  try {
    const response = await api.put(`/usuarios/${id}`, dados);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar usuário ${id}:`, error);
    throw error;
  }
};

// DELETE - Deletar usuário
export const deletarUsuario = async (id) => {
  try {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao deletar usuário ${id}:`, error);
    throw error;
  }
};

export default api;
