import { eventos as eventosSeed } from "../data/eventosData";
import { USE_API } from "./config";
import * as eventoApi from "./eventoApi";

// "Backend falso" dos eventos.
// Hoje os dados vêm do mock (eventosData) + do que o usuário cria (localStorage).
// Quando o backend real tiver as rotas de eventos, basta trocar o corpo destas
// funções por chamadas Axios, mantendo a mesma assinatura.

const STORAGE_KEY = "meetflow.eventos.custom";
const USER_KEY = "meetflow.usuarioId";
const LEFT_KEY = "meetflow.eventos.saidos";
const TRASH_KEY = "meetflow.eventos.excluidos";

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

// Converte "2026-07-12T20:00" -> "12 Jul 2026 · 20:00" (padrão de exibição)
export function formatarDataHora(valor) {
  if (!valor) return "";
  const [dataParte, horaParte] = valor.split("T");
  const [ano, mes, dia] = dataParte.split("-");
  return `${parseInt(dia, 10)} ${MESES[parseInt(mes, 10) - 1]} ${ano} · ${horaParte}`;
}

// Ordena eventos pela PROXIMIDADE da data (mais próximos primeiro).
// Eventos sem data definida vão para o fim.
export function ordenarPorData(lista) {
  const tempo = (ev) =>
    ev?.dataHora ? new Date(ev.dataHora).getTime() : Infinity;
  return [...lista].sort((a, b) => tempo(a) - tempo(b));
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

// Ids de eventos excluídos (vão para a lixeira e podem ser restaurados)
function lerEventosExcluidos() {
  try {
    const bruto = localStorage.getItem(TRASH_KEY);
    return bruto ? JSON.parse(bruto) : [];
  } catch (erro) {
    console.error("Erro ao ler eventos excluídos:", erro);
    return [];
  }
}

function salvarEventosExcluidos(lista) {
  try {
    localStorage.setItem(TRASH_KEY, JSON.stringify(lista));
  } catch (erro) {
    console.error("Não foi possível salvar a exclusão do evento:", erro);
  }
}

// Todos os eventos existentes (mock + criados), sem filtrar.
// - Eventos no armazenamento (localStorage) sobrepõem os do mock com o mesmo id
//   (é assim que editamos um evento do mock: ele é copiado com as alterações).
// - Recalcula o texto de exibição (`data`) a partir do `dataHora`, garantindo
//   que o ano apareça de forma consistente em todo o app.
function todosEventos() {
  const criados = lerEventosCriados();
  const idsCriados = new Set(criados.map((e) => String(e.id)));
  const seeds = eventosSeed.filter((e) => !idsCriados.has(String(e.id)));
  return [...seeds, ...criados].map((ev) =>
    ev.dataHora ? { ...ev, data: formatarDataHora(ev.dataHora) } : ev,
  );
}

// Lista os eventos visíveis (esconde os que o usuário saiu e os excluídos)
export function listarEventos() {
  if (USE_API.eventos) return eventoApi.listarEventos();
  const saidos = lerEventosSaidos();
  const excluidos = lerEventosExcluidos();
  return todosEventos().filter(
    (evento) =>
      !saidos.includes(String(evento.id)) &&
      !excluidos.includes(String(evento.id)),
  );
}

// Busca um evento por id (compara como string para aceitar id numérico ou texto)
export function buscarEventoPorId(id) {
  if (USE_API.eventos) return eventoApi.buscarEventoPorId(id);
  return listarEventos().find((evento) => String(evento.id) === String(id));
}

// Monta os campos comuns de um evento a partir dos dados do formulário
function montarCamposEvento(dados) {
  return {
    titulo: dados.titulo,
    tipo: dados.tipo,
    dataHora: dados.dataHora || "",
    data: formatarDataHora(dados.dataHora),
    dataHoraFim: dados.dataHoraFim || "",
    dataFim: dados.dataHoraFim ? formatarDataHora(dados.dataHoraFim) : "",
    local: dados.local,
    descricao: dados.descricao || "",
    senhaAcesso: dados.senhaAcesso || "",
    capa: dados.capa || "",
    capaOrig: dados.capaOrig || "", // original para reajustar a capa depois
    images: dados.capa ? [dados.capa] : [],
    playlist: {
      name: dados.titulo,
      description: dados.descricao || "Playlist do evento.",
    },
  };
}

// Cria um novo evento seguindo o mesmo formato dos eventos existentes
export function criarEvento(dados) {
  if (USE_API.eventos) return eventoApi.criarEvento(dados);
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

// Atualiza um evento existente. Funciona para qualquer evento: se for do mock,
// ele é copiado para o armazenamento com as alterações.
export function atualizarEvento(id, dados) {
  if (USE_API.eventos) return eventoApi.atualizarEvento(id, dados);
  const criados = lerEventosCriados();
  const indice = criados.findIndex((ev) => String(ev.id) === String(id));
  const campos = montarCamposEvento(dados);

  // Já está no armazenamento (criado pelo usuário ou mock editado antes)
  if (indice !== -1) {
    const atual = criados[indice];
    const atualizado = {
      ...atual,
      ...campos,
      participants: atual.participants || [],
      messages: atual.messages || [],
    };
    criados[indice] = atualizado;
    salvarEventosCriados(criados);
    return atualizado;
  }

  // Evento do mock (ainda não editado): copia para o armazenamento com as
  // alterações, preservando galeria, playlist e participantes originais.
  const base = buscarEventoPorId(id);
  if (!base) return null;
  const atualizado = {
    ...base,
    ...campos,
    images: base.images || campos.images,
    playlist: base.playlist || campos.playlist,
    participants: base.participants || [],
    messages: base.messages || [],
  };
  salvarEventosCriados([...criados, atualizado]);
  return atualizado;
}

// Exclui um evento (só o dono/organizador pode). Não apaga de vez:
// vai para a lixeira e pode ser restaurado.
export function excluirEvento(id) {
  if (USE_API.eventos) return eventoApi.excluirEvento(id);
  const alvo = buscarEventoPorId(id);
  if (!alvo || !isDono(alvo)) return false;

  const excluidos = lerEventosExcluidos();
  if (!excluidos.includes(String(id))) {
    salvarEventosExcluidos([...excluidos, String(id)]);
  }
  return true;
}

// "Sai" de um evento: apenas o esconde da conta do usuário atual, sem apagá-lo
// para os outros. Usado por participantes que não são donos.
export function sairDoEvento(id) {
  if (USE_API.eventos) return eventoApi.sairDoEvento(id);
  const saidos = lerEventosSaidos();
  if (!saidos.includes(String(id))) {
    salvarEventosSaidos([...saidos, String(id)]);
  }
  return true;
}

// Lixeira de eventos do usuário atual:
// - eventos que ELE saiu (motivo "saiu");
// - eventos que ELE (dono) excluiu (motivo "excluido").
export function listarLixeiraEventos() {
  const saidos = lerEventosSaidos();
  const excluidos = lerEventosExcluidos();
  return todosEventos()
    .map((evento) => {
      if (excluidos.includes(String(evento.id)) && isDono(evento)) {
        return { ...evento, motivo: "excluido" };
      }
      if (saidos.includes(String(evento.id))) {
        return { ...evento, motivo: "saiu" };
      }
      return null;
    })
    .filter(Boolean);
}

// Restaura um evento da lixeira (volta a aparecer)
export function restaurarEvento(id) {
  const saidos = lerEventosSaidos();
  if (saidos.includes(String(id))) {
    salvarEventosSaidos(saidos.filter((x) => x !== String(id)));
  }
  const excluidos = lerEventosExcluidos();
  if (excluidos.includes(String(id))) {
    salvarEventosExcluidos(excluidos.filter((x) => x !== String(id)));
  }
}
