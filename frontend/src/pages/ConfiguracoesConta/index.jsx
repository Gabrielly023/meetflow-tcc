import { useEffect, useMemo, useRef, useState } from "react";
import SettingsPageLayout from "../../components/Settings/SettingsPageLayout";
import {
  ActionButton,
  SettingsInput,
  SettingsNotice,
  SettingsSection,
  SettingRow,
  Toggle,
} from "../../components/Settings/SettingsPrimitives";
import useDialogA11y from "../../components/Settings/useDialogA11y";
import useSettingsFeedback from "../../components/Settings/useSettingsFeedback";
import {
  carregarPreferencias,
  registrarAtividade,
  salvarPreferencias,
} from "../../services/configuracoesService";
import { getUsuarioLogado, salvarSessao } from "../../services/usuarioService";

const SECOES = [
  { id: "foto-identidade", label: "Foto e identidade" },
  { id: "nome-usuario", label: "Nome e username" },
  { id: "email-telefone", label: "E-mail e telefone" },
  { id: "seguranca-conta", label: "Segurança" },
  { id: "informacoes-conta", label: "Informações" },
  { id: "zona-perigo", label: "Zona de perigo" },
];

const RESERVED = ["admin", "meetflow", "suporte", "root"];

function lerImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Não foi possível abrir a imagem."));
    leitor.readAsDataURL(arquivo);
  });
}

function formatarTelefoneBR(valor) {
  const numeros = valor.replace(/\D/g, "").replace(/^55/, "").slice(0, 11);
  if (!numeros) return "";
  const ddd = numeros.slice(0, 2);
  const restante = numeros.slice(2);
  if (numeros.length <= 2) return `+55 (${ddd}`;
  const tamanhoPrimeiroBloco = restante.length > 8 ? 5 : 4;
  const primeiro = restante.slice(0, tamanhoPrimeiroBloco);
  const segundo = restante.slice(tamanhoPrimeiroBloco);
  return `+55 (${ddd}) ${primeiro}${segundo ? `-${segundo}` : ""}`;
}

function ModalDado({ aberto, titulo, descricao, valor, onChange, email, onEmailChange, onConfirmar, onFechar, erro }) {
  const dialogRef = useDialogA11y(aberto, onFechar);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-email-titulo" tabIndex={-1} className="w-full max-w-md rounded-t-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:rounded-3xl">
        <h2 id="modal-email-titulo" className="text-xl font-semibold text-white">{titulo}</h2>
        <p className="mt-2 text-sm text-slate-400">{descricao}</p>
        <label htmlFor="novo-email-conta" className="mt-5 block text-sm font-medium text-slate-200">Novo endereço de e-mail</label>
        <input id="novo-email-conta" autoComplete="email" type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400" />
        <label htmlFor="senha-confirmacao" className="mt-5 block text-sm font-medium text-slate-200">Senha atual</label>
        <input id="senha-confirmacao" autoComplete="current-password" type="password" value={valor} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400" />
        {erro && <p role="alert" className="mt-2 text-sm text-red-300">{erro}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <ActionButton variant="secondary" onClick={onFechar}>Cancelar</ActionButton>
          <ActionButton onClick={onConfirmar}>Confirmar alteração</ActionButton>
        </div>
      </section>
    </div>
  );
}

export default function ConfiguracoesConta() {
  const usuario = getUsuarioLogado() || {};
  const defaults = {
    nome: usuario.nome || "",
    username: usuario.username || "",
    email: usuario.email || "",
    telefone: usuario.telefone || "",
    foto_perfil: usuario.foto_perfil || "",
    bio: usuario.bio || "",
    nascimento: "",
    localizacao: usuario.localizacao || "",
    doisFatores: false,
    contaDesativada: false,
  };
  const [form, setForm] = useState(() => carregarPreferencias("conta", defaults));
  const [original, setOriginal] = useState(() => carregarPreferencias("conta", defaults));
  const [saving, setSaving] = useState(false);
  const { feedback, showFeedback } = useSettingsFeedback();
  const [usernameState, setUsernameState] = useState("idle");
  const [emailModal, setEmailModal] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [telefone, setTelefone] = useState(() => formatarTelefoneBR(form.telefone));
  const [emailNovo, setEmailNovo] = useState("");
  const [otp, setOtp] = useState("");
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [confirmarPerigo, setConfirmarPerigo] = useState("");
  const [acaoPerigo, setAcaoPerigo] = useState("");
  function fecharAcaoPerigosa() {
    setAcaoPerigo("");
    setConfirmarPerigo("");
  }
  const dialogPerigoRef = useDialogA11y(Boolean(acaoPerigo), fecharAcaoPerigosa);
  const [senha, setSenha] = useState({ atual: "", nova: "", confirmar: "" });
  const [senhaStatus, setSenhaStatus] = useState("");
  const fileRef = useRef(null);
  const usernameTimer = useRef(null);
  const doisFatores = form.doisFatores;
  const alterado = JSON.stringify(form) !== JSON.stringify(original);

  useEffect(() => () => window.clearTimeout(usernameTimer.current), []);

  const requisitosSenha = useMemo(
    () => [
      ["Pelo menos 8 caracteres", senha.nova.length >= 8],
      ["Uma letra maiúscula e uma minúscula", /[a-z]/.test(senha.nova) && /[A-Z]/.test(senha.nova)],
      ["Um número", /\d/.test(senha.nova)],
      ["Um caractere especial", /[^A-Za-z0-9]/.test(senha.nova)],
    ],
    [senha.nova],
  );

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function verificarUsername(valor) {
    alterar("username", valor);
    setUsernameState(valor ? "verificando" : "idle");
    window.clearTimeout(usernameTimer.current);
    if (!valor) return;
    usernameTimer.current = window.setTimeout(() => {
      const formatoValido = /^[a-zA-Z0-9._]{3,24}$/.test(valor);
      setUsernameState(
        formatoValido && !RESERVED.includes(valor.toLowerCase()) && valor.toLowerCase() !== (usuario.username || "").toLowerCase()
          ? "disponivel"
          : formatoValido && valor.toLowerCase() === (usuario.username || "").toLowerCase()
            ? "disponivel"
            : "indisponivel",
      );
    }, 450);
  }

  async function escolherFoto(event) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      showFeedback("Selecione um arquivo de imagem válido.", "erro");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      showFeedback("A imagem deve ter no máximo 5 MB.", "erro");
      return;
    }
    try {
      alterar("foto_perfil", await lerImagem(arquivo));
    } catch (erro) {
      showFeedback(erro.message, "erro");
    }
  }

  async function salvar() {
    if (!form.nome.trim()) {
      showFeedback("Informe seu nome de exibição.", "erro");
      return;
    }
    if (form.username && !/^[a-zA-Z0-9._]{3,24}$/.test(form.username)) {
      showFeedback("Username inválido. Use 3 a 24 letras, números, ponto ou underline.", "erro");
      return;
    }
    setSaving(true);
    try {
      const atualizado = { ...usuario, ...form, nome: form.nome.trim(), username: form.username.trim() };
      await salvarPreferencias("conta", form);
      salvarSessao(atualizado);
      setOriginal(form);
      showFeedback("Alterações da conta salvas.");
    } catch (erro) {
      showFeedback(erro.message, "erro");
    } finally {
      setSaving(false);
    }
  }

  async function confirmarEmail() {
    if (!senhaAtual) {
      setErroModal("Informe sua senha atual para continuar.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNovo)) {
      setErroModal("Informe um endereço de e-mail válido.");
      return;
    }
    alterar("email", emailNovo.trim());
    setEmailModal(false);
    setSenhaAtual("");
    setEmailNovo("");
    showFeedback("Solicitação de alteração enviada. Confirme pelo novo endereço de e-mail.");
    registrarAtividade("Solicitou alteração do e-mail.");
  }

  async function enviarCodigoTelefone() {
    const quantidade = telefone.replace(/\D/g, "").replace(/^55/, "").length;
    if (quantidade < 10 || quantidade > 11) {
      showFeedback("Informe um telefone brasileiro válido com DDD.", "erro");
      return;
    }
    setOtpEnviado(true);
    setOtp("");
    showFeedback("Código de demonstração enviado: 123456.");
  }

  function confirmarCodigo() {
    if (otp !== "123456") {
      showFeedback("Código incorreto. Use o código de demonstração 123456.", "erro");
      return;
    }
    alterar("telefone", telefone);
    setOtpEnviado(false);
    showFeedback("Telefone verificado.");
    registrarAtividade("Verificou o telefone.");
  }

  async function alterarSenha(event) {
    event.preventDefault();
    if (!senha.atual || !requisitosSenha.every(([, ok]) => ok) || senha.nova !== senha.confirmar) {
      setSenhaStatus("Confira os requisitos e a confirmação da nova senha.");
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    setSenha({ atual: "", nova: "", confirmar: "" });
    setSenhaStatus("Senha alterada nesta demonstração. Nenhuma senha foi armazenada.");
    registrarAtividade("Alterou a senha da conta.", "seguranca");
  }

  async function confirmarAcaoPerigosa() {
    if (confirmarPerigo.trim() !== (form.username || usuario.username || "")) return;
    if (acaoPerigo === "desativar") {
      alterar("contaDesativada", true);
      await salvarPreferencias("conta", { ...form, contaDesativada: true });
      showFeedback("Conta marcada como desativada nesta demonstração.", "aviso");
    } else {
      showFeedback("A exclusão definitiva requer integração segura com o backend.", "aviso");
    }
    registrarAtividade(acaoPerigo === "desativar" ? "Desativou a conta." : "Solicitou exclusão da conta.", "seguranca");
    setAcaoPerigo("");
    setConfirmarPerigo("");
  }

  const accountId = usuario.id_usuario || "Conta de demonstração";
  const statusUsername = {
    verificando: "Verificando disponibilidade…",
    disponivel: "Username disponível",
    indisponivel: "Username indisponível ou formato inválido",
  };

  return (
    <>
      <SettingsPageLayout
        titulo="Conta e perfil"
        descricao="Atualize sua identidade, os dados de contato e as opções de segurança da conta."
        secoes={SECOES}
        alterado={alterado}
        salvando={saving}
        onSalvar={salvar}
        onDescartar={() => setForm(original)}
      >
        {feedback && <SettingsNotice tipo={feedback.tipo}>{feedback.texto}</SettingsNotice>}

        <SettingsSection id="foto-identidade" titulo="Foto e identidade" descricao="Sua foto e seu nome ajudam as pessoas a reconhecer você no MeetFlow.">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-fuchsia-400/60 bg-gradient-to-br from-violet-500/30 to-sky-500/30 text-3xl font-semibold text-white">
              {form.foto_perfil ? <img src={form.foto_perfil} alt="Prévia da foto de perfil" className="h-full w-full object-cover" /> : (form.username || form.nome || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Escolher foto de perfil" onChange={escolherFoto} />
              <ActionButton onClick={() => fileRef.current?.click()}>Trocar foto</ActionButton>
              {form.foto_perfil && <ActionButton variant="secondary" onClick={() => alterar("foto_perfil", "")}>Remover foto</ActionButton>}
              <p className="w-full text-center text-xs text-slate-500 sm:text-left">JPG, PNG ou WebP. Até 5 MB.</p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection id="nome-usuario" titulo="Nome e username" descricao="Escolha como seu perfil será identificado por outras pessoas.">
          <div className="grid gap-4 md:grid-cols-2">
            <SettingsInput id="nome-exibicao" label="Nome de exibição" value={form.nome} onChange={(event) => alterar("nome", event.target.value)} required maxLength={100} autoComplete="name" />
            <div>
              <SettingsInput id="username" label="Nome de usuário" value={form.username} onChange={(event) => verificarUsername(event.target.value)} placeholder="seu_usuario" maxLength={24} autoComplete="username" />
              {usernameState !== "idle" && <p aria-live="polite" className={`mt-1 text-xs ${usernameState === "disponivel" ? "text-emerald-300" : usernameState === "indisponivel" ? "text-red-300" : "text-slate-400"}`}>{statusUsername[usernameState]}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="bio-conta" className="mb-1.5 block text-sm font-medium text-slate-200">Biografia</label>
              <textarea id="bio-conta" rows={3} maxLength={300} value={form.bio} onChange={(event) => alterar("bio", event.target.value)} className="w-full resize-y rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus-visible:border-fuchsia-500 focus-visible:ring-2 focus-visible:ring-fuchsia-500/25" />
              <p className="mt-1 text-right text-xs text-slate-500">{form.bio.length}/300 caracteres</p>
            </div>
            <SettingsInput id="nascimento" label="Data de nascimento (opcional)" type="date" value={form.nascimento} onChange={(event) => alterar("nascimento", event.target.value)} max={new Date().toISOString().slice(0, 10)} />
            <SettingsInput id="localizacao" label="Localização (opcional)" value={form.localizacao} onChange={(event) => alterar("localizacao", event.target.value)} placeholder="Cidade, estado" maxLength={100} />
          </div>
        </SettingsSection>

        <SettingsSection id="email-telefone" titulo="E-mail e telefone" descricao="Mantenha seus contatos atualizados para recuperar o acesso e receber avisos importantes.">
          <SettingRow titulo="E-mail principal" descricao={form.email || "Nenhum e-mail informado"}>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">Não verificado</span>
            <ActionButton variant="secondary" onClick={() => showFeedback("Link de verificação enviado para seu e-mail.")}>Reenviar verificação</ActionButton>
            <ActionButton variant="secondary" onClick={() => { setEmailModal(true); setErroModal(""); }}>Alterar e-mail</ActionButton>
          </SettingRow>
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <SettingsInput id="telefone-conta" label="Telefone (com DDD)" type="tel" value={telefone} onChange={(event) => setTelefone(formatarTelefoneBR(event.target.value))} placeholder="+55 (11) 99999-9999" autoComplete="tel" />
            <ActionButton onClick={enviarCodigoTelefone}>Enviar código SMS</ActionButton>
          </div>
          {otpEnviado && (
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 p-4 sm:flex-row sm:items-end">
              <SettingsInput id="codigo-telefone" label="Código de 6 dígitos" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} placeholder="123456" />
              <ActionButton onClick={confirmarCodigo} disabled={otp.length !== 6}>Verificar</ActionButton>
              <button type="button" className="min-h-11 px-3 text-sm text-fuchsia-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400" onClick={enviarCodigoTelefone}>Reenviar código</button>
            </div>
          )}
          <p className="text-xs text-slate-500">Demonstração: o código SMS é 123456.</p>
        </SettingsSection>

        <SettingsSection id="seguranca-conta" titulo="Segurança da conta" descricao="Reforce a proteção das suas credenciais. As ações desta seção são simuladas nesta demonstração.">
          <form onSubmit={alterarSenha} className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
            <h3 className="font-semibold text-white">Alterar senha</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <SettingsInput id="senha-atual" label="Senha atual" type="password" value={senha.atual} onChange={(event) => setSenha({ ...senha, atual: event.target.value })} autoComplete="current-password" />
              <SettingsInput id="senha-nova" label="Nova senha" type="password" value={senha.nova} onChange={(event) => setSenha({ ...senha, nova: event.target.value })} autoComplete="new-password" />
              <SettingsInput id="senha-confirmar" label="Confirmar nova senha" type="password" value={senha.confirmar} onChange={(event) => setSenha({ ...senha, confirmar: event.target.value })} autoComplete="new-password" />
            </div>
            <ul className="grid gap-1 text-xs sm:grid-cols-2" aria-label="Requisitos de senha">
              {requisitosSenha.map(([texto, valido]) => <li key={texto} className={valido ? "text-emerald-300" : "text-slate-500"}>{valido ? "✓" : "○"} {texto}</li>)}
            </ul>
            {senha.nova && <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className={`h-full transition-all ${requisitosSenha.filter(([, ok]) => ok).length >= 3 ? "w-full bg-emerald-400" : requisitosSenha.filter(([, ok]) => ok).length >= 2 ? "w-2/3 bg-amber-400" : "w-1/3 bg-red-400"}`} /></div>}
            {senhaStatus && <p role="status" className="text-sm text-slate-300">{senhaStatus}</p>}
            <ActionButton type="submit">Atualizar senha</ActionButton>
          </form>
          <SettingRow titulo="Autenticação em duas etapas" descricao={doisFatores ? "A proteção adicional está ativa nesta demonstração." : "Solicite uma etapa adicional no próximo acesso."}>
            <Toggle checked={doisFatores} label="Autenticação em duas etapas" onChange={(valor) => { alterar("doisFatores", valor); showFeedback(valor ? "2FA ativada na demonstração." : "2FA desativada na demonstração."); }} />
          </SettingRow>
          {doisFatores && (
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
              <p className="text-sm font-semibold text-white">Códigos de recuperação</p>
              <p className="mt-1 text-xs text-slate-400">Guarde-os em local seguro. Estes códigos são apenas exemplos.</p>
              <code className="mt-3 block bg-transparent text-sm text-fuchsia-200">MF-82KQ · MF-31PL · MF-77XA · MF-09RM</code>
              <ActionButton variant="secondary" onClick={() => navigator.clipboard?.writeText("MF-82KQ\nMF-31PL\nMF-77XA\nMF-09RM")}>Copiar códigos</ActionButton>
            </div>
          )}
        </SettingsSection>

        <SettingsSection id="informacoes-conta" titulo="Informações da conta" descricao="Dados técnicos e datas vinculados à sua conta.">
          <dl className="grid gap-3 sm:grid-cols-2">
            {[["ID da conta", accountId], ["Criada em", usuario.created_at ? new Date(usuario.created_at).toLocaleDateString("pt-BR") : "Não disponível"], ["Último acesso", "Sessão atual"], ["Plano", "MeetFlow — gratuito"]].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-2 break-all text-sm text-slate-100">{value}</dd>
              </div>
            ))}
          </dl>
          <ActionButton variant="secondary" onClick={() => navigator.clipboard?.writeText(String(accountId))}>Copiar ID da conta</ActionButton>
        </SettingsSection>

        <SettingsSection id="zona-perigo" titulo="Zona de perigo" descricao="Ações simuladas para a demonstração. A exclusão real exige endpoint próprio e confirmação no servidor.">
          {form.contaDesativada && <SettingsNotice tipo="aviso">A conta está marcada como desativada nesta demonstração.</SettingsNotice>}
          <SettingRow titulo="Desativar conta temporariamente" descricao="Ocultaria seu perfil até que você entre novamente.">
            <ActionButton variant="danger" onClick={() => setAcaoPerigo("desativar")}>Desativar conta</ActionButton>
          </SettingRow>
          <SettingRow titulo="Excluir conta definitivamente" descricao="A remoção real e irreversível não é executada nesta versão frontend.">
            <ActionButton variant="danger" onClick={() => setAcaoPerigo("excluir")}>Solicitar exclusão</ActionButton>
          </SettingRow>
        </SettingsSection>
      </SettingsPageLayout>

      <ModalDado aberto={emailModal} titulo="Confirmar alteração de e-mail" descricao="Para proteger sua conta, informe o novo endereço e confirme a alteração com sua senha atual." valor={senhaAtual} onChange={setSenhaAtual} email={emailNovo} onEmailChange={setEmailNovo} erro={erroModal} onConfirmar={confirmarEmail} onFechar={() => setEmailModal(false)} />
      {acaoPerigo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <section ref={dialogPerigoRef} role="dialog" aria-modal="true" aria-labelledby="confirmar-perigo-titulo" tabIndex={-1} className="w-full max-w-lg rounded-t-3xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl sm:rounded-3xl">
            <h2 id="confirmar-perigo-titulo" className="text-xl font-semibold text-white">Confirmar {acaoPerigo === "desativar" ? "desativação" : "solicitação de exclusão"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{acaoPerigo === "desativar" ? "Seu perfil ficará marcado como inativo nesta demonstração." : "Nenhum dado será apagado nesta demonstração. A exclusão real requer integração segura com o backend."} Digite seu username para confirmar.</p>
            <label htmlFor="confirmar-username" className="mt-4 block text-sm font-medium text-slate-200">Username: {form.username || usuario.username || "vazio"}</label>
            <input id="confirmar-username" value={confirmarPerigo} onChange={(event) => setConfirmarPerigo(event.target.value)} className="mt-2 min-h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-red-400" />
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <ActionButton variant="secondary" onClick={fecharAcaoPerigosa}>Cancelar</ActionButton>
              <ActionButton variant="danger" disabled={confirmarPerigo !== (form.username || usuario.username || "")} onClick={confirmarAcaoPerigosa}>Confirmar</ActionButton>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
