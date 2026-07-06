import { eventos as eventosSeed } from "../data/eventosData";

// "Backend falso" dos eventos.
// Hoje os dados vêm do mock (eventosData) + do que o usuário cria (localStorage).
// Quando o backend real tiver as rotas de eventos, basta trocar o corpo destas
// funções por chamadas Axios, mantendo a mesma assinatura.

const STORAGE_KEY = "meetflow.eventos.custom";
const USER_KEY = "meetflow.usuarioId";
const LEFT_KEY = "meetflow.eventos.saidos";

const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

// Converte "2026-07-12T20:00" -> "12 Jul · 20:00" (padrão de exibição dos eventos)
export function formatarDataHora(valor) {
  if (!valor) return "";
  const [dataParte, horaParte] = valor.split("T");
  const [, mes, dia] = dataParte.split("-");
  return `${parseInt(dia, 10)} ${MESES[parseInt(mes, 10) - 1]} · ${horaParte}`;
}

// Id estável do "usuário atual" deste navegador (substitui o login real por enquanto)
export function getUsuarioAtualId() {
  try {
    let id = localStorage.getItem(USER_KEY);
    if (!id) {
      id = crypto?.randomUUID?.() || `user-${Date.now()}`;
      localStorage.setItem(USER_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

// Diz se o usuário atual é o dono (organizador) do evento
export function isDono(evento) {
  return Boolean(evento?.ownerId && evento.ownerId === getUsuarioAtualId());
}

function lerEventosCriados() {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    return bruto ? JSON.parse(bruto) : [];
  } catch (erro) {
    console.error("Erro ao ler eventos salvos:", erro);
    return [];
  }
}

function salvarEventosCriados(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch (erro) {
    console.error("Não foi possível salvar o evento:", erro);
  }
}

// Ids de eventos dos quais o usuário "saiu" (removidos da conta dele)
function lerEventosSaidos() {
  try {
    const bruto = localStorage.getItem(LEFT_KEY);
    return bruto ? JSON.parse(bruto) : [];
  } catch (erro) {
    console.error("Erro ao ler eventos saídos:", erro);
    return [];
  }
}

function salvarEventosSaidos(lista) {
  try {
    localStorage.setItem(LEFT_KEY, JSON.stringify(lista));
  } catch (erro) {
    console.error("Não foi possível salvar a saída do evento:", erro);
  }
}

// Lista todos os eventos (mock + criados), escondendo os que o usuário saiu
export function listarEventos() {
  const saidos = lerEventosSaidos();
  return [...eventosSeed, ...lerEventosCriados()].filter(
    (evento) => !saidos.includes(String(evento.id)),
  );
}

// Busca um evento por id (compara como string para aceitar id numérico ou texto)
export function buscarEventoPorId(id) {
  return listarEventos().find((evento) => String(evento.id) === String(id));
}

// Monta os campos comuns de um evento a partir dos dados do formulário
function montarCamposEvento(dados) {
  return {
    titulo: dados.titulo,
    tipo: dados.tipo,
    dataHora: dados.dataHora || "",
    data: formatarDataHora(dados.dataHora),
    local: dados.local,
    descricao: dados.descricao || "",
    senhaAcesso: dados.senhaAcesso || "",
    capa: dados.capa || "",
    images: dados.capa ? [dados.capa] : [],
    playlist: {
      name: dados.titulo,
      description: dados.descricao || "Playlist do evento.",
    },
  };
}

// Cria um novo evento seguindo o mesmo formato dos eventos existentes
export function criarEvento(dados) {
  const criados = lerEventosCriados();

  const novoEvento = {
    id: `evt-${Date.now()}`,
    ownerId: getUsuarioAtualId(),
    ...montarCamposEvento(dados),
    // Estruturas usadas na página de detalhe (começam vazias)
    participants: [],
    messages: [],
  };

  salvarEventosCriados([...criados, novoEvento]);
  return novoEvento;
}

// Atualiza um evento existente. Só é possível para eventos criados pelo usuário
// (os do mock não ficam no localStorage). Retorna null se não puder editar.
export function atualizarEvento(id, dados) {
  const criados = lerEventosCriados();
  const indice = criados.findIndex((evento) => String(evento.id) === String(id));

  if (indice === -1) return null;

  const atual = criados[indice];
  if (!isDono(atual)) return null;

  const atualizado = {
    ...atual,
    ...montarCamposEvento(dados),
    // preserva o que não vem do formulário
    participants: atual.participants || [],
    messages: atual.messages || [],
  };

  criados[indice] = atualizado;
  salvarEventosCriados(criados);
  return atualizado;
}

// Exclui de vez um evento criado pelo usuário (só o dono/organizador pode).
// Retorna true se excluiu.
export function excluirEvento(id) {
  const criados = lerEventosCriados();
  const alvo = criados.find((evento) => String(evento.id) === String(id));

  if (!alvo || !isDono(alvo)) return false;

  salvarEventosCriados(
    criados.filter((evento) => String(evento.id) !== String(id)),
  );
  return true;
}

// "Sai" de um evento: apenas o esconde da conta do usuário atual, sem apagá-lo
// para os outros. Usado por participantes que não são donos.
export function sairDoEvento(id) {
  const saidos = lerEventosSaidos();
  if (!saidos.includes(String(id))) {
    salvarEventosSaidos([...saidos, String(id)]);
  }
  return true;
}
