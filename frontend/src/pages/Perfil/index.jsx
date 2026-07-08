import { useEffect, useMemo, useRef, useState } from "react";
import {
  getUsuarioLogado,
  salvarSessao,
  ehModoDemo,
} from "../../services/usuarioService";
import { listarEventos } from "../../services/eventoService";
import { listarFotos } from "../../services/galeriaService";
import { listarMusicas } from "../../services/playlistService";
import ImageAdjuster from "../../components/ImageAdjuster";
import ImageChoiceModal from "../../components/ImageChoiceModal";

// Configuração de recorte de cada imagem do perfil.
const CONFIG_AVATAR = { campo: "foto_perfil", aspect: 1, round: true, outputWidth: 256 };
const CONFIG_CAPA = { campo: "capa", aspect: 3, round: false, outputWidth: 1280 };

// Reduz a imagem escolhida antes de virar data URL, para não estourar o
// localStorage. Avatar usa lado menor; capa usa lado maior.
function arquivoParaDataUrl(arquivo, maxLado = 512, qualidade = 0.85) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Falha ao carregar a imagem"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxLado || height > maxLado) {
          const escala = maxLado / Math.max(width, height);
          width = Math.round(width * escala);
          height = Math.round(height * escala);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

// Garante que o link do site tenha protocolo (para abrir em nova aba).
function urlDoSite(site) {
  if (!site) return null;
  return /^https?:\/\//i.test(site) ? site : `https://${site}`;
}

const iconeEmail = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const iconeTelefone = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const iconeLocal = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const iconeSite = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const iconeCamera = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
  </svg>
);

// Um "chip" de metadado (ícone + texto), usado na leitura do perfil.
function Chip({ icon, children, href }) {
  const conteudo = (
    <>
      <span className="text-fuchsia-400">{icon}</span>
      <span className="truncate">{children}</span>
    </>
  );
  const classe =
    "inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-950/40 px-3 py-1.5 text-sm text-slate-300";
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${classe} max-w-full transition hover:border-fuchsia-500/50 hover:text-white`}
    >
      {conteudo}
    </a>
  ) : (
    <span className={`${classe} max-w-full`}>{conteudo}</span>
  );
}

// Card de estatística com a animação de hover padrão do projeto.
function CardStat({ valor, label }) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 text-center shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20">
      <p className="texto-gradiente-2 text-3xl font-semibold">{valor}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

const LIMITE_BIO = 300;

export default function Perfil() {
  const [usuario, setUsuario] = useState(() => getUsuarioLogado() || {});
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(usuario);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const inputAvatar = useRef(null);
  const inputCapa = useRef(null);
  const [ajuste, setAjuste] = useState(null); // imagem em ajuste (crop) ou null
  const [escolha, setEscolha] = useState(null); // { config, inputRef } ou null
  const demo = ehModoDemo();

  // A mensagem de sucesso some sozinha depois de alguns segundos.
  useEffect(() => {
    if (!sucesso) return;
    const t = setTimeout(() => setSucesso(""), 3500);
    return () => clearTimeout(t);
  }, [sucesso]);

  const stats = useMemo(() => {
    const eventos = listarEventos();
    const eventosArr = Array.isArray(eventos) ? eventos : [];
    const fotos = eventosArr.reduce(
      (soma, ev) => soma + (listarFotos(ev.id)?.length || 0),
      0,
    );
    const musicas = eventosArr.reduce(
      (soma, ev) => soma + (listarMusicas(ev.id)?.length || 0),
      0,
    );
    return { eventos: eventosArr.length, fotos, musicas };
  }, []);

  // Fonte de verdade para exibir avatar/capa (form no modo edição, usuário salvo na leitura).
  const vis = editando ? form : usuario;
  const inicial = (vis.nome || "?").trim().charAt(0).toUpperCase();
  const site = urlDoSite(usuario.site);

  function abrirEdicao() {
    setForm(usuario);
    setErro("");
    setSucesso("");
    setEditando(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Ao clicar em trocar imagem: se já existe uma, pergunta antes (ajustar a
  // atual ou enviar outra). Se não existe, abre direto o seletor de arquivo.
  function pedirTroca(config, inputRef) {
    if (form[config.campo]) {
      setEscolha({ config, inputRef });
    } else {
      inputRef.current?.click();
    }
  }

  // Ao escolher um arquivo, abre o ajustador (crop) em vez de aplicar direto.
  async function aoEscolherArquivo(e, config) {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite reescolher o mesmo arquivo depois
    if (!arquivo || !arquivo.type.startsWith("image/")) return;
    try {
      // pré-reduz só para o ajuste ficar leve; o recorte final sai do canvas
      const src = await arquivoParaDataUrl(arquivo, 1280, 0.9);
      setAjuste({ src, ...config });
    } catch (err) {
      console.error(err);
      setErro("Não foi possível carregar essa imagem.");
    }
  }

  function handleSalvar(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    const nome = (form.nome || "").trim();
    const username = (form.username || "").trim();
    const email = (form.email || "").trim();
    const telefone = (form.telefone || "").replace(/\D/g, "");

    if (!nome) {
      setErro("O nome não pode ficar vazio.");
      return;
    }
    if (username && !/^[a-zA-Z0-9._]+$/.test(username)) {
      setErro(
        "Nome de usuário inválido: use apenas letras, números, ponto (.) e underline (_).",
      );
      return;
    }

    const atualizado = {
      ...usuario,
      nome,
      username,
      email,
      telefone,
      bio: (form.bio || "").trim(),
      localizacao: (form.localizacao || "").trim(),
      site: (form.site || "").trim(),
      foto_perfil: form.foto_perfil || "",
      capa: form.capa || "",
      // originais (para reajustar depois); ficam só no front
      foto_perfil_orig: form.foto_perfil_orig || "",
      capa_orig: form.capa_orig || "",
    };

    // Guarda na sessão local (mantém o token). Quando o backend de perfil
    // existir, aqui também entraria o PUT /usuarios/:id (nome, username,
    // email, telefone, foto_perfil). Bio/capa/local/site são extras do front.
    salvarSessao(atualizado);
    setUsuario(atualizado);
    setEditando(false);
    setSucesso("Perfil atualizado com sucesso!");
  }

  return (
    <>
      {escolha && (
        <ImageChoiceModal
          onAdjust={() => {
            const campo = escolha.config.campo;
            // ajusta sobre a imagem ORIGINAL (dá folga pra arrastar);
            // se não houver original guardado, cai para a recortada.
            setAjuste({
              src: form[`${campo}_orig`] || form[campo],
              ...escolha.config,
            });
            setEscolha(null);
          }}
          onPick={() => {
            const ref = escolha.inputRef;
            setEscolha(null);
            ref.current?.click();
          }}
          onCancel={() => setEscolha(null)}
        />
      )}

      {ajuste && (
        <ImageAdjuster
          src={ajuste.src}
          aspect={ajuste.aspect}
          round={ajuste.round}
          outputWidth={ajuste.outputWidth}
          onCancel={() => setAjuste(null)}
          onConfirm={(dataUrl) => {
            // guarda a recortada (para exibir) e a original (para reajustar)
            setForm((prev) => ({
              ...prev,
              [ajuste.campo]: dataUrl,
              [`${ajuste.campo}_orig`]: ajuste.src,
            }));
            setAjuste(null);
          }}
        />
      )}

    <main className="flex-1 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Cabeçalho */}
        <div className="text-center">
          <p className="texto-gradiente-2 text-sm font-semibold uppercase tracking-[0.3em]">
            Conta
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Meu <span className="texto-gradiente">perfil</span>
          </h1>
          <p className="mt-2 text-slate-400">
            Personalize como você aparece para os outros no MeetFlow.
          </p>
        </div>

        {sucesso && (
          <div className="rounded-2xl border border-green-500/40 bg-green-900/40 px-4 py-3 text-sm text-green-200">
            {sucesso}
          </div>
        )}
        {erro && (
          <div className="rounded-2xl border border-red-500/40 bg-red-900/40 px-4 py-3 text-sm text-red-200">
            {erro}
          </div>
        )}

        {/* Cartão do perfil */}
        <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20">
          {/* Capa */}
          <div className="relative h-44 w-full sm:h-52">
            {vis.capa ? (
              <img src={vis.capa} alt="Capa" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-orange-500/50 via-fuchsia-500/50 to-sky-500/50" />
            )}
            {/* leve escurecida embaixo, para o avatar/textos destacarem */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />

            {!editando ? (
              <button
                type="button"
                onClick={abrirEdicao}
                className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-slate-950/90"
              >
                Editar perfil
              </button>
            ) : (
              <button
                type="button"
                onClick={() => pedirTroca(CONFIG_CAPA, inputCapa)}
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950/70 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-slate-950/90"
              >
                {iconeCamera}
                Trocar capa
              </button>
            )}
            <input
              ref={inputCapa}
              type="file"
              accept="image/*"
              onChange={(e) => aoEscolherArquivo(e, CONFIG_CAPA)}
              className="hidden"
            />

            {/* Avatar sobreposto */}
            <div className="absolute -bottom-14 left-6 sm:left-8">
              <div className="relative">
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-orange-500 via-fuchsia-500 to-sky-500 p-[3px] shadow-lg shadow-fuchsia-500/25">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-950">
                    {vis.foto_perfil ? (
                      <img src={vis.foto_perfil} alt="Foto de perfil" className="h-full w-full object-cover" />
                    ) : (
                      <span className="fonte-flow text-4xl font-bold text-white">
                        {inicial}
                      </span>
                    )}
                  </div>
                </div>
                {editando && (
                  <button
                    type="button"
                    onClick={() => pedirTroca(CONFIG_AVATAR, inputAvatar)}
                    className="absolute bottom-1 right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-105 active:scale-95"
                    title="Trocar foto"
                    aria-label="Trocar foto"
                  >
                    {iconeCamera}
                  </button>
                )}
                <input
                  ref={inputAvatar}
                  type="file"
                  accept="image/*"
                  onChange={(e) => aoEscolherArquivo(e, CONFIG_AVATAR)}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Corpo */}
          <div className="px-6 pb-8 pt-16 sm:px-8">
            {editando ? (
              <form onSubmit={handleSalvar} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo id="nome" label="Nome" value={form.nome || ""} onChange={handleChange} placeholder="Seu nome completo" />
                  <Campo id="username" label="Nome de usuário" value={form.username || ""} onChange={handleChange} placeholder="seu_usuario" />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-200">
                      Biografia
                    </label>
                    <span className="text-xs text-slate-500">
                      {(form.bio || "").length}/{LIMITE_BIO}
                    </span>
                  </div>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    maxLength={LIMITE_BIO}
                    value={form.bio || ""}
                    onChange={handleChange}
                    placeholder="Conte um pouco sobre você, seus eventos favoritos, seu estilo..."
                    className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo id="localizacao" label="Localização" value={form.localizacao || ""} onChange={handleChange} placeholder="Cidade, Estado" />
                  <Campo id="site" label="Site / Link" value={form.site || ""} onChange={handleChange} placeholder="seusite.com ou @seuinsta" />
                  <Campo id="email" label="Email" type="email" value={form.email || ""} onChange={handleChange} placeholder="seu@email.com" />
                  <Campo id="telefone" label="Telefone" type="tel" value={form.telefone || ""} onChange={handleChange} placeholder="(11) 98765-4321" />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95"
                  >
                    Salvar alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditando(false)}
                    className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="text-2xl font-semibold text-white">
                    {usuario.nome || "Sem nome"}
                  </h2>
                  {demo && (
                    <span className="inline-flex items-center rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                      Modo demonstração
                    </span>
                  )}
                </div>
                {usuario.username && (
                  <p className="texto-gradiente-2 text-sm font-medium">
                    @{usuario.username}
                  </p>
                )}

                {usuario.bio ? (
                  <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-slate-300">
                    {usuario.bio}
                  </p>
                ) : (
                  <p className="mt-4 text-sm italic text-slate-500">
                    Sem biografia ainda. Clique em “Editar perfil” para se apresentar.
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {usuario.localizacao && <Chip icon={iconeLocal}>{usuario.localizacao}</Chip>}
                  {site && (
                    <Chip icon={iconeSite} href={site}>
                      {usuario.site.replace(/^https?:\/\//i, "")}
                    </Chip>
                  )}
                  {usuario.email && <Chip icon={iconeEmail}>{usuario.email}</Chip>}
                  {usuario.telefone && <Chip icon={iconeTelefone}>{usuario.telefone}</Chip>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4">
          <CardStat valor={stats.eventos} label="Eventos" />
          <CardStat valor={stats.fotos} label="Fotos" />
          <CardStat valor={stats.musicas} label="Músicas" />
        </div>
      </div>
    </main>
    </>
  );
}

// Campo de texto do formulário de edição.
function Campo({ id, label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25"
      />
    </div>
  );
}
