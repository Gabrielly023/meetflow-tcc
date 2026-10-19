import { useState } from "react";
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
import {
  APARENCIA_PADRAO,
  aplicarPreferenciasAparencia,
  carregarPreferencias,
  notificarAparenciaAtualizada,
  salvarPreferencias,
} from "../../services/configuracoesService";

const SECOES = [
  { id: "tema-aparencia", label: "Tema" },
  { id: "idioma-regiao", label: "Idioma e região" },
  { id: "tamanho-texto", label: "Tamanho dos textos" },
  { id: "acessibilidade-visual", label: "Acessibilidade" },
  { id: "densidade-interface", label: "Densidade" },
];
const TEMAS = [
  { value: "escuro", label: "Escuro", description: "Fundo marinho e superfícies profundas." },
  { value: "claro", label: "Claro", description: "Superfícies claras e texto escuro." },
  { value: "automatico", label: "Automático", description: "Acompanha a preferência do sistema." },
];
const TAMANHOS = [
  { value: "pequeno", label: "Pequeno", description: "Mais conteúdo na tela." },
  { value: "padrao", label: "Padrão", description: "Tamanho recomendado." },
  { value: "grande", label: "Grande", description: "Texto ampliado para leitura." },
  { value: "extra", label: "Extra grande", description: "Maior escala de texto." },
];

export default function ConfiguracoesAparencia() {
  const [prefs, setPrefs] = useState(() => carregarPreferencias("aparencia", APARENCIA_PADRAO));
  const { feedback, showFeedback } = useSettingsFeedback();
  const [salvando, setSalvando] = useState(false);

  async function update(changes, mensagem = "Preferência aplicada no site.") {
    const previous = prefs;
    const next = { ...prefs, ...changes };
    setPrefs(next);
    aplicarPreferenciasAparencia(next);
    setSalvando(true);
    try {
      await salvarPreferencias("aparencia", next);
      notificarAparenciaAtualizada();
      showFeedback(mensagem);
    } catch (erro) {
      setPrefs(previous);
      aplicarPreferenciasAparencia(previous);
      notificarAparenciaAtualizada();
      showFeedback(erro.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function restaurar() {
    const previous = prefs;
    setPrefs(APARENCIA_PADRAO);
    aplicarPreferenciasAparencia(APARENCIA_PADRAO);
    try {
      await salvarPreferencias("aparencia", APARENCIA_PADRAO);
      notificarAparenciaAtualizada();
      showFeedback("Preferências de aparência restauradas.");
    } catch (erro) {
      setPrefs(previous);
      aplicarPreferenciasAparencia(previous);
      notificarAparenciaAtualizada();
      showFeedback(erro.message, "erro");
    }
  }

  return (
    <SettingsPageLayout titulo="Aparência e idioma" descricao="Personalize a experiência visual e as preferências regionais do MeetFlow." secoes={SECOES}>
      {feedback && <SettingsNotice tipo={feedback.tipo}>{feedback.texto}</SettingsNotice>}
      {salvando && <p role="status" className="text-xs text-slate-500">Aplicando preferências…</p>}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-5">
          <SettingsSection id="tema-aparencia" titulo="Tema" descricao="A escolha é aplicada imediatamente às telas do aplicativo e salva neste navegador.">
            <SettingsOptionCards value={prefs.tema} onChange={(value) => void update({ tema: value }, "Tema aplicado no site.")} options={TEMAS} ariaLabel="Tema do aplicativo" />
          </SettingsSection>

          <SettingsSection id="idioma-regiao" titulo="Idioma e região" descricao="O idioma fica salvo para integrar com uma futura camada de tradução. As datas usam as preferências selecionadas nesta tela.">
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsSelect id="idioma" label="Idioma" value={prefs.idioma} onChange={(event) => update({ idioma: event.target.value }, "Idioma salvo. A tradução completa depende da integração i18n.")} options={[
                { value: "pt-BR", label: "Português (Brasil)" }, { value: "en", label: "English" }, { value: "es", label: "Español" },
              ]} />
              <SettingsSelect id="formato-hora" label="Formato de hora" value={prefs.formatoHora || "24h"} onChange={(event) => update({ formatoHora: event.target.value })} options={[{ value: "24h", label: "24 horas" }, { value: "12h", label: "12 horas" }]} />
              <SettingsSelect id="formato-data" label="Formato de data" value={prefs.formatoData || "dd/MM/yyyy"} onChange={(event) => update({ formatoData: event.target.value })} options={[{ value: "dd/MM/yyyy", label: "DD/MM/AAAA" }, { value: "MM/dd/yyyy", label: "MM/DD/AAAA" }, { value: "yyyy-MM-dd", label: "AAAA-MM-DD" }]} />
              <SettingsSelect id="fuso" label="Fuso horário" value={prefs.fuso || "America/Sao_Paulo"} onChange={(event) => update({ fuso: event.target.value })} options={[{ value: "America/Sao_Paulo", label: "Brasília (UTC−03:00)" }, { value: "America/Manaus", label: "Manaus (UTC−04:00)" }, { value: "Europe/Lisbon", label: "Lisboa" }]} />
              <SettingsSelect id="primeiro-dia" label="Primeiro dia da semana" value={prefs.primeiroDia || "segunda"} onChange={(event) => update({ primeiroDia: event.target.value })} options={[{ value: "segunda", label: "Segunda-feira" }, { value: "domingo", label: "Domingo" }]} />
              <SettingsSelect id="regiao-moeda" label="Região e moeda" value={prefs.regiao || "BRL"} onChange={(event) => update({ regiao: event.target.value })} options={[{ value: "BRL", label: "Brasil · R$ (BRL)" }, { value: "USD", label: "Estados Unidos · $ (USD)" }, { value: "EUR", label: "Europa · € (EUR)" }]} />
            </div>
          </SettingsSection>

          <SettingsSection id="tamanho-texto" titulo="Tamanho dos textos" descricao="A escala altera o tamanho-base tipográfico do site inteiro.">
            <SettingsOptionCards value={prefs.tamanhoTexto} onChange={(value) => void update({ tamanhoTexto: value }, "Tamanho do texto aplicado globalmente.")} options={TAMANHOS} ariaLabel="Tamanho dos textos" />
            <p aria-live="polite" className="rounded-xl bg-slate-950/50 p-4 text-sm text-slate-300" style={{ fontSize: `${{ pequeno: 0.9, padrao: 1, grande: 1.1, extra: 1.2 }[prefs.tamanhoTexto] || 1}em` }}>Prévia: organize seus momentos especiais com o MeetFlow.</p>
            <ActionButton variant="secondary" onClick={() => void update({ tamanhoTexto: "padrao" }, "Tamanho padrão restaurado.")}>Restaurar padrão</ActionButton>
          </SettingsSection>

          <SettingsSection id="acessibilidade-visual" titulo="Acessibilidade visual" descricao="Ajustes adicionais para conforto e navegação por teclado.">
            <SettingRow titulo="Reduzir animações" descricao="Diminui movimentos decorativos e transições não essenciais."><Toggle checked={prefs.reduzirAnimacoes} label="Reduzir animações" onChange={(value) => update({ reduzirAnimacoes: value })} /></SettingRow>
            <SettingRow titulo="Alto contraste" descricao="Reforça bordas e foco para facilitar a identificação dos controles."><Toggle checked={prefs.altoContraste} label="Alto contraste" onChange={(value) => update({ altoContraste: value })} /></SettingRow>
            <SettingsSelect id="espacamento" label="Espaçamento de texto" value={prefs.espacamento} onChange={(event) => update({ espacamento: event.target.value })} options={[{ value: "padrao", label: "Padrão" }, { value: "ampliado", label: "Ampliado" }]} />
          </SettingsSection>

          <SettingsSection id="densidade-interface" titulo="Densidade da interface" descricao="Ajusta o espaçamento de alguns elementos compatíveis.">
            <SettingsOptionCards value={prefs.densidade} onChange={(value) => void update({ densidade: value })} options={[{ value: "confortavel", label: "Confortável", description: "Espaçamento padrão para leitura." }, { value: "compacta", label: "Compacta", description: "Reduz espaçamentos em listas e cards." }]} ariaLabel="Densidade da interface" />
          </SettingsSection>
          <ActionButton variant="secondary" onClick={restaurar}>Restaurar todas as preferências de aparência</ActionButton>
        </div>

        <aside aria-label="Pré-visualização ao vivo" className="lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">Prévia ao vivo</p>
            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
              <span className="rounded-full bg-violet-500/20 px-2 py-1 text-[10px] text-violet-200">{prefs.tema}</span>
              <h2 className="mt-3 text-lg font-semibold text-white">Seu próximo evento</h2>
              <p className="mt-1 text-xs text-slate-400">Sábado · 20:00 · Centro</p>
              <button type="button" className="mt-4 min-h-10 rounded-xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-3 text-xs font-semibold text-white">Ver evento</button>
            </div>
            <p className="mt-3 text-xs text-slate-500">Idioma: {prefs.idioma}. Algumas telas ainda não são traduzidas.</p>
          </div>
        </aside>
      </div>
    </SettingsPageLayout>
  );
}
