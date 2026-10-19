import { useMemo, useState } from "react";
import SettingsPageLayout from "../../components/Settings/SettingsPageLayout";
import {
  ActionButton,
  SettingsNotice,
  SettingsSection,
  SettingsSelect,
  SettingRow,
  Toggle,
} from "../../components/Settings/SettingsPrimitives";
import useSettingsFeedback from "../../components/Settings/useSettingsFeedback";
import { carregarPreferencias, salvarPreferencias } from "../../services/configuracoesService";

const SECOES = [
  { id: "controle-geral", label: "Controle geral" },
  { id: "mensagens-novas", label: "Mensagens novas" },
  { id: "convites-confirmacoes", label: "Convites e confirmações" },
  { id: "lembretes-evento", label: "Lembretes do evento" },
  { id: "novidades-comunicados", label: "Novidades" },
  { id: "horario-silencioso", label: "Horário silencioso" },
  { id: "entrega-notificacoes", label: "Entrega" },
];
const DEFAULT = {
  pausadas: false,
  pausaAte: "reativar",
  canais: { push: true, email: true, app: true },
  mensagens: true,
  convites: true,
  confirmacoes: true,
  recusas: true,
  alteracoes: true,
  cancelamentos: true,
  lembretes: true,
  lembretesOrganizo: true,
  lembretesParticipo: true,
  antecedencia: ["1d", "2h"],
  novidades: false,
  dicas: false,
  ofertas: false,
  resumoSemanal: true,
  mostrarPrevia: true,
  som: true,
  silencioso: false,
  inicioSilencio: "22:00",
  fimSilencio: "08:00",
  diasSilenciosos: [],
  urgentesDuranteSilencio: true,
  frequencia: "imediata",
  silenciados: ["Ana"],
};
const CANAIS = [
  { id: "push", label: "Push" },
  { id: "email", label: "E-mail" },
  { id: "app", label: "Dentro do app" },
];
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const CONVERSAS = ["Ana", "Bruno", "Carol", "Grupo Noite de Música"];

function MatrizCanais({ titulo, chaves, dados, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/70">
      <div className="hidden grid-cols-[minmax(0,1fr)_repeat(3,100px)] gap-3 bg-slate-900/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid">
        <span>{titulo}</span>
        {CANAIS.map((canal) => <span key={canal.id} className="text-center">{canal.label}</span>)}
      </div>
      {chaves.map((chave) => (
        <div key={chave.id} className="grid gap-3 border-t border-slate-800/70 bg-slate-950/40 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_repeat(3,100px)] sm:items-center">
          <span className="text-sm font-medium text-slate-200">{chave.label}</span>
          {CANAIS.map((canal) => (
            <label key={canal.id} className="flex min-h-10 items-center justify-between gap-2 text-xs text-slate-400 sm:justify-center">
              <span className="sm:hidden">{canal.label}</span>
              <Toggle checked={Boolean(dados[chave.id]?.[canal.id])} label={`${chave.label}, ${canal.label}`} onChange={(value) => onToggle(chave.id, canal.id, value)} />
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ConfiguracoesNotificacoes() {
  const [prefs, setPrefs] = useState(() => carregarPreferencias("notificacoes", DEFAULT));
  const [consulta, setConsulta] = useState("");
  const [salvando, setSalvando] = useState(false);
  const { feedback, showFeedback } = useSettingsFeedback();
  const [mensagensCanais, setMensagensCanais] = useState(() => carregarPreferencias("notificacoes-canais", {
    novasMensagens: { push: true, email: false, app: true },
    convites: { push: true, email: true, app: true },
    lembretes: { push: true, email: true, app: true },
  }));
  const silenciados = prefs.silenciados || [];
  const conversasVisiveis = useMemo(() => CONVERSAS.filter((nome) => nome.toLowerCase().includes(consulta.toLowerCase())), [consulta]);

  async function salvar(novas, canalNovo = mensagensCanais) {
    setSalvando(true);
    try {
      await Promise.all([
        salvarPreferencias("notificacoes", novas),
        salvarPreferencias("notificacoes-canais", canalNovo),
      ]);
      showFeedback("Preferências de notificação salvas.");
    } catch (erro) {
      showFeedback(erro.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  function alterar(campo, valor) {
    const novas = { ...prefs, [campo]: valor };
    setPrefs(novas);
    void salvar(novas);
  }

  function alternarCanal(tipo, canal, valor) {
    const novosCanais = {
      ...mensagensCanais,
      [tipo]: { ...mensagensCanais[tipo], [canal]: valor },
    };
    setMensagensCanais(novosCanais);
    void salvar(prefs, novosCanais);
  }

  function alternarDia(dia) {
    const dias = prefs.diasSilenciosos.includes(dia)
      ? prefs.diasSilenciosos.filter((item) => item !== dia)
      : [...prefs.diasSilenciosos, dia];
    alterar("diasSilenciosos", dias);
  }

  return (
    <SettingsPageLayout titulo="Notificações" descricao="Escolha quais avisos receber, por onde e em quais momentos." secoes={SECOES}>
      {feedback && <SettingsNotice tipo={feedback.tipo}>{feedback.texto}</SettingsNotice>}
      {salvando && <p role="status" className="text-xs text-slate-500">Salvando preferências…</p>}

      <SettingsSection id="controle-geral" titulo="Controle geral" descricao="Pause notificações por um período ou mantenha o controle sempre ativo.">
        <SettingRow titulo="Pausar todas as notificações" descricao={prefs.pausadas ? `Pausa: ${prefs.pausaAte === "reativar" ? "até reativar" : prefs.pausaAte}.` : "Os avisos continuam sendo enviados conforme suas preferências."}>
          <Toggle checked={prefs.pausadas} label="Pausar todas as notificações" onChange={(value) => alterar("pausadas", value)} />
        </SettingRow>
        {prefs.pausadas && (
          <SettingsSelect id="pausa-ate" label="Duração da pausa" value={prefs.pausaAte} onChange={(event) => alterar("pausaAte", event.target.value)} options={[
            { value: "1h", label: "Por 1 hora" }, { value: "8h", label: "Por 8 horas" }, { value: "amanha", label: "Até amanhã" }, { value: "reativar", label: "Até eu reativar" },
          ]} />
        )}
      </SettingsSection>

      <SettingsSection id="mensagens-novas" titulo="Mensagens novas" descricao="Defina os canais usados para conversas e mensagens de eventos.">
        <MatrizCanais titulo="Mensagens novas" chaves={[{ id: "novasMensagens", label: "Nova mensagem" }]} dados={mensagensCanais} onToggle={alternarCanal} />
        <SettingRow titulo="Mostrar prévia da mensagem" descricao="Exibe um trecho do conteúdo na notificação.">
          <Toggle checked={prefs.mostrarPrevia} label="Mostrar prévia da mensagem" onChange={(valor) => alterar("mostrarPrevia", valor)} />
        </SettingRow>
        <SettingRow titulo="Som de notificação" descricao="Reproduzir um som ao receber novas mensagens.">
          <Toggle checked={prefs.som} label="Som de notificação" onChange={(valor) => alterar("som", valor)} />
        </SettingRow>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4">
          <label htmlFor="buscar-conversa" className="mb-2 block text-sm font-medium text-slate-200">Conversas silenciadas</label>
          <input id="buscar-conversa" value={consulta} onChange={(event) => setConsulta(event.target.value)} placeholder="Buscar conversa" className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400" />
          <ul className="mt-3 space-y-2">
            {conversasVisiveis.filter((nome) => silenciados.includes(nome)).map((nome) => (
              <li key={nome} className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
                {nome}<button type="button" onClick={() => alterar("silenciados", silenciados.filter((item) => item !== nome))} className="min-h-10 px-2 text-fuchsia-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">Reativar</button>
              </li>
            ))}
            {silenciados.length === 0 && <li className="text-sm text-slate-500">Nenhuma conversa silenciada.</li>}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {conversasVisiveis.filter((nome) => !silenciados.includes(nome)).map((nome) => <button key={nome} type="button" onClick={() => alterar("silenciados", [...silenciados, nome])} className="min-h-10 rounded-full border border-slate-700 px-3 text-xs text-slate-300 hover:border-fuchsia-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">Silenciar {nome}</button>)}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="convites-confirmacoes" titulo="Convites e confirmações" descricao="Ajuste os alertas para mudanças importantes nos eventos.">
        <MatrizCanais titulo="Tipo de aviso" chaves={[
          { id: "convites", label: "Novos convites" },
          { id: "confirmacoes", label: "Confirmações de presença" },
          { id: "recusas", label: "Recusas" },
          { id: "alteracoes", label: "Alterações no evento" },
          { id: "cancelamentos", label: "Cancelamentos" },
        ]} dados={Object.fromEntries(["convites", "confirmacoes", "recusas", "alteracoes", "cancelamentos"].map((id) => [id, mensagensCanais.convites]))} onToggle={(id, canal, valor) => alternarCanal("convites", canal, valor)} />
      </SettingsSection>

      <SettingsSection id="lembretes-evento" titulo="Lembretes do evento" descricao="Escolha a antecedência e os eventos para os quais quer receber lembretes.">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-200">Antecedência dos lembretes</legend>
          <div className="flex flex-wrap gap-2">
            {[["1d", "1 dia antes"], ["2h", "2 horas antes"], ["30m", "30 minutos antes"], ["custom", "Personalizado"]].map(([valor, label]) => {
              const checked = prefs.antecedencia.includes(valor);
              return <label key={valor} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs transition ${checked ? "border-fuchsia-400/50 bg-fuchsia-500/10 text-fuchsia-100" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}><input type="checkbox" checked={checked} onChange={() => alterar("antecedencia", checked ? prefs.antecedencia.filter((item) => item !== valor) : [...prefs.antecedencia, valor])} className="accent-fuchsia-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400" />{label}</label>;
            })}
          </div>
        </fieldset>
        <MatrizCanais titulo="Lembretes" chaves={[{ id: "lembretes", label: "Lembretes do evento" }]} dados={mensagensCanais} onToggle={alternarCanal} />
        <SettingRow titulo="Eventos que organizo" descricao="Receber lembretes dos eventos criados por você.">
          <Toggle checked={prefs.lembretesOrganizo} label="Lembretes de eventos que organizo" onChange={(valor) => alterar("lembretesOrganizo", valor)} />
        </SettingRow>
        <SettingRow titulo="Eventos de que participo" descricao="Receber lembretes dos eventos para os quais confirmou presença.">
          <Toggle checked={prefs.lembretesParticipo} label="Lembretes de eventos que participo" onChange={(valor) => alterar("lembretesParticipo", valor)} />
        </SettingRow>
      </SettingsSection>

      <SettingsSection id="novidades-comunicados" titulo="Novidades e comunicados" descricao="Escolha se deseja receber novidades, sugestões e resumos do MeetFlow.">
        {[
          ["novidades", "Novidades do app", "Recursos e atualizações do MeetFlow."],
          ["dicas", "Dicas", "Sugestões para organizar seus eventos."],
          ["ofertas", "Ofertas", "Comunicações promocionais opcionais."],
          ["resumoSemanal", "Resumo semanal", "Um resumo periódico da sua atividade."],
        ].map(([id, titulo, descricao]) => <SettingRow key={id} titulo={titulo} descricao={descricao}><Toggle checked={prefs[id]} label={titulo} onChange={(valor) => alterar(id, valor)} /></SettingRow>)}
      </SettingsSection>

      <SettingsSection id="horario-silencioso" titulo="Horário silencioso" descricao="Silencie avisos não urgentes em horários definidos.">
        <SettingRow titulo="Ativar horário silencioso" descricao="As notificações voltam a ser entregues depois do período escolhido.">
          <Toggle checked={prefs.silencioso} label="Ativar horário silencioso" onChange={(valor) => alterar("silencioso", valor)} />
        </SettingRow>
        {prefs.silencioso && <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Início<input type="time" value={prefs.inicioSilencio} onChange={(event) => alterar("inicioSilencio", event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" /></label>
            <label className="text-sm text-slate-300">Fim<input type="time" value={prefs.fimSilencio} onChange={(event) => alterar("fimSilencio", event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" /></label>
          </div>
          <fieldset><legend className="mb-2 text-sm font-semibold text-slate-200">Dias da semana</legend><div className="flex flex-wrap gap-2">{DIAS.map((dia) => <label key={dia} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-800 px-3 text-xs text-slate-300"><input type="checkbox" checked={prefs.diasSilenciosos.includes(dia)} onChange={() => alternarDia(dia)} className="accent-fuchsia-500" />{dia}</label>)}</div></fieldset>
          <SettingRow titulo="Permitir alertas urgentes" descricao="Avisos críticos podem ser entregues durante o horário silencioso."><Toggle checked={prefs.urgentesDuranteSilencio} label="Permitir alertas urgentes durante horário silencioso" onChange={(valor) => alterar("urgentesDuranteSilencio", valor)} /></SettingRow>
        </>}
      </SettingsSection>

      <SettingsSection id="entrega-notificacoes" titulo="Entrega" descricao="Defina a frequência das notificações e teste sua configuração.">
        <SettingsSelect id="frequencia-notificacoes" label="Frequência de entrega" value={prefs.frequencia} onChange={(event) => alterar("frequencia", event.target.value)} options={[
          { value: "imediata", label: "Imediata" }, { value: "diario", label: "Resumo diário" }, { value: "semanal", label: "Resumo semanal" },
        ]} />
        <SettingRow titulo="Notificação de teste" descricao="Envia uma prévia de demonstração para este navegador.">
          <ActionButton onClick={() => showFeedback("Notificação de teste enviada nesta demonstração.")}>Enviar teste</ActionButton>
        </SettingRow>
      </SettingsSection>
    </SettingsPageLayout>
  );
}
