import { useMemo, useRef, useState } from "react";
import ModalConfirmacao from "../../components/ModalConfirmacao";
import SettingsPageLayout from "../../components/Settings/SettingsPageLayout";
import {
  ActionButton,
  SettingsInput,
  SettingsNotice,
  SettingsSection,
  SettingsSelect,
  SettingRow,
} from "../../components/Settings/SettingsPrimitives";
import useDialogA11y from "../../components/Settings/useDialogA11y";
import useSettingsFeedback from "../../components/Settings/useSettingsFeedback";
import {
  baixarArquivo,
  carregarPreferencias,
  estimarArmazenamento,
  obterSnapshotLocal,
  registrarAtividade,
  restaurarSnapshot,
  salvarPreferencias,
  validarBackup,
} from "../../services/configuracoesService";

const SECOES = [
  { id: "exportar-dados", label: "Exportar dados" },
  { id: "backup-local", label: "Backup local" },
  { id: "historico-app", label: "Histórico do app" },
  { id: "armazenamento-cache", label: "Armazenamento" },
  { id: "zona-atencao", label: "Zona de atenção" },
];
const CATEGORIAS = [
  { id: "perfil", label: "Perfil" },
  { id: "eventos", label: "Eventos" },
  { id: "convites", label: "Convites e participantes" },
  { id: "mensagens", label: "Mensagens" },
  { id: "configuracoes", label: "Configurações" },
  { id: "midia", label: "Mídia" },
];
const EXPORTS_KEY = "meetflow.settings.exportacoes";
const LEMBRETE_DEFAULT = { lembrete: "mensal" };

function lerExportacoes() {
  try {
    return JSON.parse(localStorage.getItem(EXPORTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function dadosPorCategoria(categorias) {
  const snapshot = obterSnapshotLocal().dados;
  const inclui = {
    perfil: (chave) => chave === "meetflow.usuario",
    eventos: (chave) => chave.startsWith("meetflow.eventos."),
    convites: (chave) => chave.includes("participantes") || chave.includes("convites"),
    mensagens: (chave) => chave.startsWith("meetflow.chat."),
    configuracoes: (chave) => chave.startsWith("meetflow.settings.") || chave === "meetflow.config.prefs",
    midia: (chave) => chave.startsWith("meetflow.galeria.") || chave.startsWith("meetflow.playlists") || chave.startsWith("meetflow.musicas"),
  };
  return Object.fromEntries(Object.entries(snapshot).filter(([chave]) => categorias.some((categoria) => inclui[categoria]?.(chave))));
}

function paraCsv(dados) {
  const linhas = [["categoria", "chave", "dados"]];
  Object.entries(dados).forEach(([chave, valor]) => {
    const categoria = CATEGORIAS.find(({ id }) => {
      const filtro = {
        perfil: (key) => key === "meetflow.usuario",
        eventos: (key) => key.startsWith("meetflow.eventos."),
        convites: (key) => key.includes("participantes") || key.includes("convites"),
        mensagens: (key) => key.startsWith("meetflow.chat."),
        configuracoes: (key) => key.startsWith("meetflow.settings.") || key === "meetflow.config.prefs",
        midia: (key) => key.startsWith("meetflow.galeria.") || key.startsWith("meetflow.playlists") || key.startsWith("meetflow.musicas"),
      };
      return filtro[id](chave);
    })?.label || "Outros";
    linhas.push([categoria, chave, JSON.stringify(valor)]);
  });
  return linhas.map((linha) => linha.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(",")).join("\r\n");
}

function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ConfiguracoesDados() {
  const [selecionadas, setSelecionadas] = useState(["perfil", "eventos", "mensagens", "configuracoes"]);
  const [formato, setFormato] = useState("json");
  const [periodo, setPeriodo] = useState("sempre");
  const [exportacoes, setExportacoes] = useState(lerExportacoes);
  const [solicitando, setSolicitando] = useState(false);
  const [lembrete, setLembrete] = useState(() => carregarPreferencias("backup", LEMBRETE_DEFAULT).lembrete);
  const [arquivoBackup, setArquivoBackup] = useState(null);
  const [backupCarregado, setBackupCarregado] = useState(null);
  const [confirmarRestore, setConfirmarRestore] = useState(false);
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);
  const [confirmarReset, setConfirmarReset] = useState(false);
  const [textoReset, setTextoReset] = useState("");
  const resetDialogRef = useDialogA11y(confirmarReset, () => {
    setConfirmarReset(false);
    setTextoReset("");
  });
  const [busca, setBusca] = useState("");
  const [filtroHistorico, setFiltroHistorico] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [historico, setHistorico] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("meetflow.settings.historico") || "[]");
    } catch {
      return [];
    }
  });
  const fileRef = useRef(null);
  const { feedback, showFeedback } = useSettingsFeedback();
  const armazenamento = estimarArmazenamento();
  const totalBytes = armazenamento.reduce((total, item) => total + item.bytes, 0);
  const conversas = useMemo(() => historico.filter((item) => {
    const texto = `${item.descricao} ${item.tipo}`.toLowerCase();
    return texto.includes(busca.toLowerCase()) && (filtroHistorico === "todos" || item.tipo === filtroHistorico);
  }), [historico, busca, filtroHistorico]);

  function alternarCategoria(id) {
    setSelecionadas((atual) => atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]);
  }

  async function solicitarExportacao() {
    if (!selecionadas.length) {
      showFeedback("Selecione pelo menos uma categoria para exportar.", "erro");
      return;
    }
    setSolicitando(true);
    const registro = { id: Date.now(), status: "Preparando", data: new Date().toISOString(), formato, categorias: [...selecionadas], periodo };
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      const dados = dadosPorCategoria(selecionadas);
      const conteudo = formato === "csv" ? paraCsv(dados) : JSON.stringify({ aplicativo: "MeetFlow", exportadoEm: registro.data, periodo, dados }, null, 2);
      baixarArquivo(`meetflow-exportacao.${formato}`, conteudo, formato === "csv" ? "text/csv;charset=utf-8" : "application/json");
      const concluido = { ...registro, status: "Pronto", tamanho: formatarTamanho(new Blob([conteudo]).size), expira: new Date(Date.now() + 7 * 86400000).toISOString() };
      const novaLista = [concluido, ...exportacoes].slice(0, 20);
      localStorage.setItem(EXPORTS_KEY, JSON.stringify(novaLista));
      setExportacoes(novaLista);
      showFeedback("Exportação pronta e baixada.");
      registrarAtividade("Exportou dados da conta.", "dados");
    } catch (erro) {
      showFeedback(`Não foi possível concluir a exportação: ${erro.message}`, "erro");
    } finally {
      setSolicitando(false);
    }
  }

  function criarBackup() {
    try {
      const conteudo = JSON.stringify(obterSnapshotLocal(), null, 2);
      baixarArquivo(`meetflow-backup-${new Date().toISOString().slice(0, 10)}.json`, conteudo);
      showFeedback("Backup local criado e baixado.");
      registrarAtividade("Criou um backup local.", "dados");
    } catch (erro) {
      showFeedback(erro.message, "erro");
    }
  }

  async function selecionarBackup(event) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;
    if (!arquivo.name.toLowerCase().endsWith(".json") || arquivo.size > 10 * 1024 * 1024) {
      showFeedback("Selecione um arquivo JSON de até 10 MB.", "erro");
      return;
    }
    try {
      const parsed = JSON.parse(await arquivo.text());
      const validado = validarBackup(parsed);
      setArquivoBackup(arquivo);
      setBackupCarregado(validado);
    } catch (erro) {
      setArquivoBackup(null);
      setBackupCarregado(null);
      showFeedback(erro.message || "O arquivo JSON está inválido.", "erro");
    }
  }

  function confirmarRestauracao() {
    try {
      const quantidade = restaurarSnapshot(backupCarregado);
      setBackupCarregado(null);
      setArquivoBackup(null);
      setConfirmarRestore(false);
      showFeedback(`Backup restaurado: ${quantidade} itens recuperados. Recarregue a página para atualizar os dados.`);
    } catch (erro) {
      showFeedback(erro.message, "erro");
    }
  }

  function limparCache() {
    ["meetflow.playlistCapas", "meetflow.config.prefs"].forEach((chave) => localStorage.removeItem(chave));
    setConfirmarLimpeza(false);
    showFeedback("Cache e preferências temporárias locais foram removidos.");
  }

  function redefinirAplicativo() {
    if (textoReset !== "REDEFINIR") return;
    for (let indice = localStorage.length - 1; indice >= 0; indice -= 1) {
      const chave = localStorage.key(indice);
      if (chave?.startsWith("meetflow.") && !chave.includes("token")) localStorage.removeItem(chave);
    }
    setTextoReset("");
    setConfirmarReset(false);
    showFeedback("Dados locais do MeetFlow removidos. Sua sessão foi preservada.");
  }

  function limparHistorico() {
    localStorage.removeItem("meetflow.settings.historico");
    setHistorico([]);
    showFeedback("Histórico local removido.");
  }

  async function salvarLembrete(valor) {
    setLembrete(valor);
    try {
      await salvarPreferencias("backup", { lembrete: valor });
      showFeedback("Lembrete de backup atualizado.");
    } catch (erro) {
      showFeedback(erro.message, "erro");
    }
  }

  const paginados = conversas.slice(0, pagina * 10);

  return (
    <>
      <SettingsPageLayout titulo="Dados e backup" descricao="Exporte seus dados, crie cópias locais e acompanhe o espaço usado pelo MeetFlow." secoes={SECOES}>
        {feedback && <SettingsNotice tipo={feedback.tipo}>{feedback.texto}</SettingsNotice>}
        <SettingsSection id="exportar-dados" titulo="Exportar dados" descricao="Gere um arquivo local com as categorias selecionadas. Tokens de acesso e senhas não são incluídos.">
          <div className="flex flex-wrap gap-3">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-slate-700 px-3 text-sm text-slate-200"><input type="checkbox" checked={selecionadas.length === CATEGORIAS.length} onChange={() => setSelecionadas(selecionadas.length === CATEGORIAS.length ? [] : CATEGORIAS.map(({ id }) => id))} className="accent-fuchsia-500" />Selecionar tudo</label>
            {CATEGORIAS.map(({ id, label }) => <label key={id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-slate-800 px-3 text-xs text-slate-300"><input type="checkbox" checked={selecionadas.includes(id)} onChange={() => alternarCategoria(id)} className="accent-fuchsia-500" />{label}</label>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SettingsSelect id="formato-exportacao" label="Formato" value={formato} onChange={(event) => setFormato(event.target.value)} options={[{ value: "json", label: "JSON" }, { value: "csv", label: "CSV" }]} />
            <SettingsSelect id="periodo-exportacao" label="Período" value={periodo} onChange={(event) => setPeriodo(event.target.value)} options={[{ value: "sempre", label: "Todo o período" }, { value: "ano", label: "Último ano" }, { value: "mes", label: "Último mês" }]} />
            <div className="flex flex-col justify-end"><p className="text-xs text-slate-400">Estimativa local</p><p className="mt-1 text-lg font-semibold text-white">{formatarTamanho(totalBytes)}</p></div>
          </div>
          <ActionButton onClick={solicitarExportacao} loading={solicitando} disabled={!selecionadas.length}>Solicitar exportação</ActionButton>
          {exportacoes.length > 0 && <div><h3 className="mb-2 text-sm font-semibold text-white">Exportações anteriores</h3><ul className="space-y-2">{exportacoes.map((item) => <li key={item.id} className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"><span className="text-slate-200">{item.formato.toUpperCase()} · {item.categorias.join(", ")}</span><span className="text-slate-500">{new Date(item.data).toLocaleString("pt-BR")} · {item.status} · expira em {item.expira ? new Date(item.expira).toLocaleDateString("pt-BR") : "7 dias"}</span></li>)}</ul></div>}
        </SettingsSection>

        <SettingsSection id="backup-local" titulo="Backup local" descricao="Crie um arquivo JSON real com os dados locais do aplicativo. O backup não contém tokens nem credenciais.">
          <SettingRow titulo="Criar backup agora" descricao="Baixa uma cópia de segurança neste dispositivo.">
            <ActionButton onClick={criarBackup}>Baixar backup</ActionButton>
          </SettingRow>
          <SettingsSelect id="lembrete-backup" label="Lembrete automático" value={lembrete} onChange={(event) => void salvarLembrete(event.target.value)} options={[{ value: "nunca", label: "Nunca" }, { value: "semanal", label: "Semanal" }, { value: "mensal", label: "Mensal" }]} />
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
            <label htmlFor="restaurar-backup" className="block text-sm font-semibold text-white">Restaurar a partir de arquivo</label>
            <p className="mt-1 text-xs text-slate-400">Escolha um backup MeetFlow em JSON (máximo 10 MB).</p>
            <input ref={fileRef} id="restaurar-backup" type="file" accept=".json,application/json" onChange={selecionarBackup} className="mt-3 block w-full text-sm text-slate-300 file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-violet-500/20 file:px-4 file:text-sm file:font-semibold file:text-violet-100 hover:file:bg-violet-500/30" />
            {arquivoBackup && backupCarregado && <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3"><p className="text-sm text-white">{arquivoBackup.name}</p><p className="mt-1 text-xs text-slate-400">Prévia: {Object.keys(backupCarregado.dados).length} itens · exportado em {new Date(backupCarregado.exportadoEm).toLocaleString("pt-BR")}</p><ActionButton onClick={() => setConfirmarRestore(true)}>Restaurar backup</ActionButton></div>}
          </div>
          <SettingsNotice tipo="aviso">O backup não é criptografado nesta versão. Guarde o arquivo em local seguro.</SettingsNotice>
        </SettingsSection>

        <SettingsSection id="historico-app" titulo="Histórico do app" descricao="Atividades locais registradas pelas ações desta demonstração.">
          <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
            <SettingsInput id="buscar-historico" label="Buscar no histórico" value={busca} onChange={(event) => { setBusca(event.target.value); setPagina(1); }} placeholder="Ex.: backup" />
            <SettingsSelect id="filtro-historico" label="Tipo de atividade" value={filtroHistorico} onChange={(event) => { setFiltroHistorico(event.target.value); setPagina(1); }} options={[{ value: "todos", label: "Todos" }, { value: "configuracao", label: "Configurações" }, { value: "dados", label: "Dados" }, { value: "seguranca", label: "Segurança" }]} />
          </div>
          {paginados.length ? <ol className="space-y-2">{paginados.map((item) => <li key={item.id} className="flex flex-col justify-between gap-1 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 sm:flex-row sm:items-center"><span className="text-sm text-slate-200">{item.descricao}</span><span className="text-xs text-slate-500">{item.tipo} · {new Date(item.data).toLocaleString("pt-BR")}</span></li>)}</ol> : <p className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">Nenhuma atividade corresponde aos filtros.</p>}
          {paginados.length < conversas.length && <ActionButton variant="secondary" onClick={() => setPagina((atual) => atual + 1)}>Carregar mais</ActionButton>}
          {historico.length > 0 && <ActionButton variant="danger" onClick={limparHistorico}>Limpar histórico</ActionButton>}
        </SettingsSection>

        <SettingsSection id="armazenamento-cache" titulo="Armazenamento e cache" descricao="Estimativa do armazenamento local deste navegador.">
          <p className="text-sm text-slate-300">Uso estimado: <strong className="text-white">{formatarTamanho(totalBytes)}</strong></p>
          <div className="space-y-3">{armazenamento.map((item) => {
            const percent = totalBytes ? Math.max(3, Math.round(item.bytes / totalBytes * 100)) : 0;
            return <div key={item.nome}><div className="mb-1 flex justify-between text-xs text-slate-400"><span>{item.nome}</span><span>{formatarTamanho(item.bytes)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400" style={{ width: `${percent}%` }} /></div></div>;
          })}</div>
          <p className="text-xs text-slate-500">O navegador não disponibiliza uma quota exata para cada categoria; valores são estimativas.</p>
          <ActionButton variant="secondary" onClick={() => setConfirmarLimpeza(true)}>Limpar cache local</ActionButton>
        </SettingsSection>

        <SettingsSection id="zona-atencao" titulo="Zona de atenção" descricao="A redefinição apaga dados MeetFlow locais deste navegador, mas mantém o token da sessão.">
          <ActionButton variant="danger" onClick={() => setConfirmarReset(true)}>Apagar dados locais e redefinir app</ActionButton>
        </SettingsSection>
      </SettingsPageLayout>

      <ModalConfirmacao aberto={confirmarRestore} titulo="Restaurar este backup?" mensagem="Os dados locais correspondentes serão substituídos pelo conteúdo do arquivo. A sessão de acesso não será alterada." textoConfirmar="Restaurar" perigo onConfirmar={confirmarRestauracao} onCancelar={() => setConfirmarRestore(false)} />
      <ModalConfirmacao aberto={confirmarLimpeza} titulo="Limpar cache local?" mensagem="Capas em cache e preferências locais antigas serão removidas. Seus eventos e sua sessão serão preservados." textoConfirmar="Limpar cache" perigo onConfirmar={limparCache} onCancelar={() => setConfirmarLimpeza(false)} />
      {confirmarReset && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"><section ref={resetDialogRef} role="dialog" aria-modal="true" aria-labelledby="titulo-reset" tabIndex={-1} className="w-full max-w-lg rounded-t-3xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl sm:rounded-3xl"><h2 id="titulo-reset" className="text-xl font-semibold text-white">Redefinir dados locais?</h2><p className="mt-2 text-sm text-slate-300">Esta ação não pode ser desfeita. Digite REDEFINIR para confirmar.</p><label htmlFor="texto-reset" className="mt-4 block text-sm text-slate-200">Confirmação</label><input id="texto-reset" value={textoReset} onChange={(event) => setTextoReset(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" /><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><ActionButton variant="secondary" onClick={() => { setConfirmarReset(false); setTextoReset(""); }}>Cancelar</ActionButton><ActionButton variant="danger" disabled={textoReset !== "REDEFINIR"} onClick={redefinirAplicativo}>Apagar dados</ActionButton></div></section></div>}
    </>
  );
}
