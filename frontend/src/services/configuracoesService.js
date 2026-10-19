const PREFIXO = "meetflow.settings.";
const HISTORICO_KEY = `${PREFIXO}historico`;
const APARENCIA_EVENT = "meetflow:aparencia-atualizada";

export const APARENCIA_PADRAO = {
  tema: "escuro",
  idioma: "pt-BR",
  tamanhoTexto: "padrao",
  reduzirAnimacoes: false,
  altoContraste: false,
  espacamento: "padrao",
  densidade: "confortavel",
};

export function carregarPreferencias(chave, padrao) {
  try {
    const valor = localStorage.getItem(`${PREFIXO}${chave}`);
    return valor ? { ...padrao, ...JSON.parse(valor) } : { ...padrao };
  } catch (erro) {
    throw new Error(`Não foi possível carregar as preferências: ${erro.message}`, { cause: erro });
  }
}

export async function salvarPreferencias(chave, dados) {
  // TODO(api): trocar por PUT /usuarios/:id/configuracoes.
  await new Promise((resolve) => window.setTimeout(resolve, 180));
  try {
    localStorage.setItem(`${PREFIXO}${chave}`, JSON.stringify(dados));
    registrarAtividade(`Atualizou ${chave.replaceAll("-", " ")}.`);
    return dados;
  } catch (erro) {
    throw new Error(`Não foi possível salvar as alterações: ${erro.message}`, { cause: erro });
  }
}

export function registrarAtividade(descricao, tipo = "configuracao") {
  try {
    const bruto = localStorage.getItem(HISTORICO_KEY);
    const historico = bruto ? JSON.parse(bruto) : [];
    historico.unshift({
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      descricao,
      tipo,
      data: new Date().toISOString(),
    });
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico.slice(0, 200)));
  } catch (erro) {
    throw new Error(`Não foi possível atualizar o histórico: ${erro.message}`, { cause: erro });
  }
}

export function aplicarPreferenciasAparencia(preferencias = APARENCIA_PADRAO) {
  const raiz = document.documentElement;
  const tema =
    preferencias.tema === "automatico"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "claro"
        : "escuro"
      : preferencias.tema;
  const escalas = { pequeno: 0.9, padrao: 1, grande: 1.1, extra: 1.2 };

  raiz.dataset.theme = tema;
  raiz.style.setProperty(
    "--meetflow-scale",
    String(escalas[preferencias.tamanhoTexto] || 1),
  );
  raiz.classList.toggle("reduzir-animacoes", Boolean(preferencias.reduzirAnimacoes));
  raiz.classList.toggle("alto-contraste", Boolean(preferencias.altoContraste));
  raiz.classList.toggle(
    "espacamento-ampliado",
    preferencias.espacamento === "ampliado",
  );
  raiz.classList.toggle(
    "interface-compacta",
    preferencias.densidade === "compacta",
  );
}

export function notificarMudancaAparencia() {
  window.dispatchEvent(new Event(APARENCIA_EVENT));
}

export function obterSnapshotLocal() {
  const dados = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const chave = localStorage.key(i);
    if (
      !chave?.startsWith("meetflow.") ||
      chave.includes("token") ||
      chave.includes("senha")
    ) {
      continue;
    }
    try {
      const valor = JSON.parse(localStorage.getItem(chave));
      if (chave === "meetflow.usuario" && valor && typeof valor === "object") {
        delete valor.senha;
        delete valor.password;
      }
      dados[chave] = valor;
    } catch {
      // Valores simples também fazem parte do backup.
      dados[chave] = localStorage.getItem(chave);
    }
  }
  return {
    aplicativo: "MeetFlow",
    versao: 1,
    exportadoEm: new Date().toISOString(),
    dados,
  };
}

export function validarBackup(backup) {
  if (
    !backup ||
    backup.aplicativo !== "MeetFlow" ||
    backup.versao !== 1 ||
    !backup.dados ||
    typeof backup.dados !== "object" ||
    Array.isArray(backup.dados)
  ) {
    throw new Error("O arquivo não corresponde a um backup válido do MeetFlow.");
  }
  const chavesInvalidas = Object.keys(backup.dados).filter(
    (chave) =>
      !chave.startsWith("meetflow.") ||
      chave.includes("token") ||
      chave.includes("senha"),
  );
  if (chavesInvalidas.length) {
    throw new Error("O backup contém dados não permitidos e não pode ser restaurado.");
  }
  return backup;
}

export function restaurarSnapshot(backup) {
  validarBackup(backup);
  try {
    Object.entries(backup.dados).forEach(([chave, valor]) => {
      localStorage.setItem(chave, JSON.stringify(valor));
    });
    registrarAtividade("Restaurou um backup local.", "dados");
    return Object.keys(backup.dados).length;
  } catch (erro) {
    throw new Error(`Não foi possível restaurar o backup: ${erro.message}`, { cause: erro });
  }
}

export function baixarArquivo(nome, conteudo, tipo = "application/json") {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function estimarArmazenamento() {
  const grupos = {
    Perfil: ["meetflow.usuario"],
    Eventos: ["meetflow.eventos."],
    Conversas: ["meetflow.chat."],
    Mídia: ["meetflow.galeria.", "meetflow.playlists", "meetflow.musicas"],
    Preferências: [PREFIXO],
  };
  const resultado = Object.entries(grupos).map(([nome, prefixos]) => {
    let bytes = 0;
    for (let i = 0; i < localStorage.length; i += 1) {
      const chave = localStorage.key(i);
      if (chave && prefixos.some((prefixo) => chave.startsWith(prefixo))) {
        bytes += new Blob([chave, localStorage.getItem(chave) || ""]).size;
      }
    }
    return { nome, bytes };
  });
  return resultado;
}

export function notificarAparenciaAtualizada() {
  notificarMudancaAparencia();
}
