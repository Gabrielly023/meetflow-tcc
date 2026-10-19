import { useMemo, useState } from "react";
import SettingsPageLayout from "../../components/Settings/SettingsPageLayout";
import {
  ActionButton,
  SettingsNotice,
  SettingsOptionCards,
  SettingsSection,
  SettingsSelect,
  SettingRow,
  Toggle,
} from "../../components/Settings/SettingsPrimitives";
import useSettingsFeedback from "../../components/Settings/useSettingsFeedback";
import { carregarPreferencias, registrarAtividade, salvarPreferencias } from "../../services/configuracoesService";

const SECOES = [
  { id: "sessoes-ativas", label: "Sessões ativas" },
  { id: "visibilidade-perfil", label: "Visibilidade do perfil" },
  { id: "controle-acesso", label: "Controle de acesso" },
  { id: "dados-rastreamento", label: "Dados e rastreamento" },
  { id: "alertas-seguranca", label: "Alertas de segurança" },
  { id: "atividade-seguranca", label: "Atividade de segurança" },
];
const DEFAULT = {
  perfil: "publico",
  controles: {
    foto: "todos", bio: "todos", email: "privado", telefone: "privado",
    organizo: "conectados", participo: "conectados", atividade: "conectados",
    online: "conectados",
  },
  convidar: "conectados",
  mensagem: "conectados",
  encontravelUsername: true,
  encontravelEmail: false,
  encontravelTelefone: false,
  aprovacaoManual: false,
  analytics: true,
  personalizacao: true,
  loginNovo: true,
  tentativaSuspeita: true,
  dadosSensivel: true,
  bloqueados: ["conta_exemplo"],
  apps: ["MeetFlow Web (este navegador)", "MeetFlow Calendar (demonstração)"],
};
const SESSIONS = [
  { id: "current", dispositivo: "Este dispositivo", detalhes: "Windows · Chrome · São Paulo, Brasil · IP 192.168.××.××", acesso: "Agora", atual: true },
  { id: "mobile", dispositivo: "Celular", detalhes: "Android · Chrome · São Paulo, Brasil · IP 10.××.××.××", acesso: "Há 2 dias", atual: false },
];
const REGISTROS = [
  { tipo: "Login", descricao: "Acesso realizado neste navegador", data: new Date(Date.now() - 1000 * 60 * 4) },
  { tipo: "Perfil", descricao: "Informações do perfil consultadas", data: new Date(Date.now() - 1000 * 60 * 60 * 6) },
  { tipo: "Segurança", descricao: "Preferências de segurança revisadas", data: new Date(Date.now() - 1000 * 60 * 60 * 28) },
];
const VISIBILITY = [
  { value: "publico", label: "Público", description: "Qualquer pessoa pode ver as informações definidas como públicas." },
  { value: "conectados", label: "Somente conectados", description: "Seu perfil fica visível para pessoas conectadas a você." },
  { value: "privado", label: "Privado", description: "Somente você vê os detalhes do seu perfil." },
];
const VIS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "conectados", label: "Conectados" },
  { value: "privado", label: "Só eu" },
];

export default function ConfiguracoesPrivacidade() {
  const [prefs, setPrefs] = useState(() => carregarPreferencias("privacidade", DEFAULT));
  const [sessao, setSessao] = useState(SESSIONS);
  const [preview, setPreview] = useState("publico");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);
  const { feedback, showFeedback } = useSettingsFeedback();
  const bloqueados = useMemo(() => prefs.bloqueados || [], [prefs.bloqueados]);
  const apps = useMemo(() => prefs.apps || [], [prefs.apps]);
  const users = useMemo(() => bloqueados.filter((nome) => nome.toLowerCase().includes(busca.toLowerCase())), [bloqueados, busca]);

  async function update(changes) {
    const next = { ...prefs, ...changes };
    setPrefs(next);
    setSalvando(true);
    try {
      await salvarPreferencias("privacidade", next);
      showFeedback("Preferências de privacidade salvas.");
    } catch (erro) {
      showFeedback(erro.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  function updateControl(key, value) {
    void update({ controles: { ...prefs.controles, [key]: value } });
  }

  function encerrar(id) {
    setSessao((atual) => atual.filter((item) => item.id !== id));
    showFeedback("Sessão encerrada nesta demonstração.");
    registrarAtividade("Encerrou uma sessão ativa.", "seguranca");
  }

  return (
    <SettingsPageLayout titulo="Privacidade e acesso" descricao="Controle quem pode ver suas informações, acessar sua conta e entrar em contato." secoes={SECOES}>
      {feedback && <SettingsNotice tipo={feedback.tipo}>{feedback.texto}</SettingsNotice>}
      {salvando && <p role="status" className="text-xs text-slate-500">Salvando preferências…</p>}

      <SettingsSection id="sessoes-ativas" titulo="Sessões ativas" descricao="Confira os dispositivos conectados e encerre sessões que você não reconhece. Lista ilustrativa da demonstração.">
        {sessao.length === 0 && <SettingsNotice>Nenhuma outra sessão ativa.</SettingsNotice>}
        {sessao.map((item) => (
          <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xl">▣</span>
              <div><h3 className="font-semibold text-white">{item.dispositivo} {item.atual && <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">ATUAL</span>}</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">{item.detalhes}</p><p className="mt-1 text-xs text-slate-500">Último acesso: {item.acesso}</p></div>
            </div>
            {!item.atual && <ActionButton variant="danger" onClick={() => encerrar(item.id)}>Encerrar sessão</ActionButton>}
          </article>
        ))}
        <ActionButton variant="secondary" onClick={() => { setSessao((atual) => atual.filter((item) => item.atual)); showFeedback("Outras sessões encerradas nesta demonstração."); }}>Encerrar todas as outras sessões</ActionButton>
      </SettingsSection>

      <SettingsSection id="visibilidade-perfil" titulo="Visibilidade do perfil" descricao="Escolha uma regra geral e personalize o acesso a cada informação.">
        <SettingsOptionCards value={prefs.perfil} onChange={(value) => void update({ perfil: value })} options={VISIBILITY} ariaLabel="Visibilidade geral do perfil" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["foto", "Foto de perfil"], ["bio", "Biografia"], ["email", "E-mail"],
            ["telefone", "Telefone"], ["organizo", "Eventos que organizo"],
            ["participo", "Eventos de que participo"], ["atividade", "Atividades recentes"],
            ["online", "Status online e última vez visto"],
          ].map(([key, label]) => <SettingsSelect key={key} id={`vis-${key}`} label={label} value={prefs.controles[key]} onChange={(event) => updateControl(key, event.target.value)} options={VIS_OPTIONS} />)}
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-semibold text-white">Ver meu perfil como…</h3><p className="mt-1 text-xs text-slate-400">Prévia ilustrativa das regras selecionadas.</p></div>
            <div className="flex gap-2">
              <button type="button" aria-pressed={preview === "publico"} onClick={() => setPreview("publico")} className={`min-h-11 rounded-xl px-3 text-xs ${preview === "publico" ? "bg-fuchsia-500/20 text-fuchsia-100" : "text-slate-400 hover:text-white"}`}>Público</button>
              <button type="button" aria-pressed={preview === "conectado"} onClick={() => setPreview("conectado")} className={`min-h-11 rounded-xl px-3 text-xs ${preview === "conectado" ? "bg-fuchsia-500/20 text-fuchsia-100" : "text-slate-400 hover:text-white"}`}>Conectado</button>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm font-semibold text-white">Hannah Reis <span className="text-xs font-normal text-slate-500">@hannah_reis</span></p>
            <p className="mt-2 text-xs text-slate-400">{preview === "publico" ? (prefs.controles.bio === "todos" ? "Biografia visível para o público." : "Biografia não exibida ao público.") : (prefs.controles.bio !== "privado" ? "Biografia visível para conexões." : "Biografia privada.")}</p>
            <span className="mt-3 inline-block rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-400">Prévia simulada</span>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="controle-acesso" titulo="Controle de acesso" descricao="Defina quem pode encontrar você e como as pessoas podem interagir.">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsSelect id="quem-convida" label="Quem pode me convidar" value={prefs.convidar} onChange={(event) => update({ convidar: event.target.value })} options={[{ value: "todos", label: "Todos" }, { value: "conectados", label: "Conectados" }, { value: "ninguem", label: "Ninguém" }]} />
          <SettingsSelect id="quem-mensagem" label="Quem pode me enviar mensagem" value={prefs.mensagem} onChange={(event) => update({ mensagem: event.target.value })} options={[{ value: "todos", label: "Todos" }, { value: "conectados", label: "Conectados" }, { value: "ninguem", label: "Ninguém" }]} />
        </div>
        {[
          ["encontravelUsername", "Encontrar por username"],
          ["encontravelEmail", "Encontrar por e-mail"],
          ["encontravelTelefone", "Encontrar por telefone"],
          ["aprovacaoManual", "Aprovar convites manualmente"],
        ].map(([key, titulo]) => <SettingRow key={key} titulo={titulo}><Toggle checked={prefs[key]} label={titulo} onChange={(value) => update({ [key]: value })} /></SettingRow>)}
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
          <label htmlFor="buscar-bloqueados" className="mb-2 block text-sm font-semibold text-white">Usuários bloqueados</label>
          <input id="buscar-bloqueados" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar usuário" className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400" />
          {users.length ? <ul className="mt-3 space-y-2">{users.map((nome) => <li key={nome} className="flex items-center justify-between gap-3 rounded-xl bg-slate-900 px-3 py-2 text-sm text-slate-300">{nome}<button type="button" className="min-h-10 text-fuchsia-300 hover:text-white focus-visible:ring-2 focus-visible:ring-fuchsia-400" onClick={() => update({ bloqueados: bloqueados.filter((item) => item !== nome) })}>Desbloquear</button></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Nenhum usuário bloqueado encontrado.</p>}
        </div>
        <div className="space-y-2"><h3 className="text-sm font-semibold text-white">Aplicativos conectados</h3>{apps.length ? apps.map((app) => <SettingRow key={app} titulo={app} descricao="Acesso local demonstrativo"><ActionButton variant="secondary" onClick={() => update({ apps: apps.filter((item) => item !== app) })}>Revogar acesso</ActionButton></SettingRow>) : <p className="text-sm text-slate-500">Nenhum aplicativo conectado.</p>}</div>
      </SettingsSection>

      <SettingsSection id="dados-rastreamento" titulo="Dados e rastreamento" descricao="Estas opções são armazenadas localmente nesta demonstração.">
        <SettingRow titulo="Cookies de análise" descricao="Permitir métricas anônimas para melhorar o produto."><Toggle checked={prefs.analytics} label="Cookies de análise" onChange={(value) => update({ analytics: value })} /></SettingRow>
        <SettingRow titulo="Personalização" descricao="Usar preferências locais para adaptar a experiência."><Toggle checked={prefs.personalizacao} label="Personalização" onChange={(value) => update({ personalizacao: value })} /></SettingRow>
      </SettingsSection>

      <SettingsSection id="alertas-seguranca" titulo="Alertas de segurança" descricao="Seja avisado sobre atividade incomum na conta.">
        {[
          ["loginNovo", "Login em novo dispositivo"],
          ["tentativaSuspeita", "Tentativa suspeita de acesso"],
          ["dadosSensivel", "Alteração de dados sensíveis"],
        ].map(([key, titulo]) => <SettingRow key={key} titulo={titulo}><Toggle checked={prefs[key]} label={titulo} onChange={(value) => update({ [key]: value })} /></SettingRow>)}
      </SettingsSection>

      <SettingsSection id="atividade-seguranca" titulo="Registro de atividade de segurança" descricao="Atividade demonstrativa recente; os eventos reais dependem da API.">
        <ol className="space-y-3">{REGISTROS.map((item) => <li key={item.tipo} className="flex gap-3 border-l border-fuchsia-500/30 pl-4"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-fuchsia-400" /><div><p className="text-sm text-slate-200">{item.descricao}</p><p className="mt-1 text-xs text-slate-500">{item.tipo} · {item.data.toLocaleString("pt-BR")}</p></div></li>)}</ol>
      </SettingsSection>
    </SettingsPageLayout>
  );
}
