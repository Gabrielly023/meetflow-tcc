import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ImageAdjuster from "../ImageAdjuster";
import ImageChoiceModal from "../ImageChoiceModal";

const TIPOS = [
  "Show",
  "Social",
  "Tecnologia",
  "Outdoor",
  "Entretenimento",
  "Cultural",
  "Outro",
];

// Reduz a imagem enviada antes de virar data URL (evita guardar fotos enormes).
function arquivoParaDataUrl(arquivo, maxLado = 1280, qualidade = 0.9) {
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

const inputClass =
  "w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/25";

const labelClass = "mb-2 block text-sm font-medium text-slate-200";

// Formulário compartilhado para criar e editar eventos.
// - valorInicial: preenche os campos (usado na edição)
// - onSubmit(dados): recebe os dados já validados
// - textoBotao / cancelarHref: variam entre criar e editar
export default function EventoForm({
  valorInicial = {},
  onSubmit,
  textoBotao = "Salvar",
  cancelarHref = "/eventos",
}) {
  const [form, setForm] = useState({
    titulo: valorInicial.titulo || "",
    tipo: valorInicial.tipo || "Social",
    dataHora: valorInicial.dataHora || "",
    dataHoraFim: valorInicial.dataHoraFim || "",
    local: valorInicial.local || "",
    senhaAcesso: valorInicial.senhaAcesso || "",
    descricao: valorInicial.descricao || "",
    // Extras opcionais (aplicados na criação/edição; não ficam no objeto evento).
    // Na edição, vêm preenchidos com o que o evento já tiver (ver EditarEvento).
    mapaLink: valorInicial.mapaLink || "",
    playlistLink: valorInicial.playlistLink || "",
  });
  const [capa, setCapa] = useState(valorInicial.capa || "");
  const [capaOrig, setCapaOrig] = useState(valorInicial.capaOrig || ""); // original p/ reajustar
  const [capaErro, setCapaErro] = useState(false);
  const [ajusteCapa, setAjusteCapa] = useState(null); // imagem em ajuste ou null
  const [escolhaCapa, setEscolhaCapa] = useState(false); // modal "ajustar/outra"
  const [arrastando, setArrastando] = useState(false); // feedback de drag-and-drop
  const [erro, setErro] = useState("");
  const inputCapaRef = useRef(null);

  // A capa atual só é ajustável se for uma imagem enviada (data URL); links
  // externos não podem ser recortados (bloqueio de segurança/CORS do canvas).
  const capaAjustavel = capa.startsWith("data:") && !capaErro;

  function aoClicarEnviar() {
    if (capaAjustavel) setEscolhaCapa(true);
    else inputCapaRef.current?.click();
  }

  // Sempre que a capa muda, zera o erro para tentar carregar de novo
  // (padrão de ajuste de estado durante o render, ao mudar o valor anterior)
  const [capaAnterior, setCapaAnterior] = useState(capa);
  if (capa !== capaAnterior) {
    setCapaAnterior(capa);
    setCapaErro(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Processa uma imagem (vinda do seletor OU de arrastar-e-soltar): valida,
  // reduz e abre o ajustador (crop) antes de aplicar a capa.
  async function processarArquivo(arquivo) {
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      setErro("A capa precisa ser um arquivo de imagem.");
      return;
    }
    try {
      setErro("");
      setAjusteCapa(await arquivoParaDataUrl(arquivo));
    } catch (err) {
      console.error(err);
      setErro("Não foi possível carregar essa imagem.");
    }
  }

  function handleArquivo(event) {
    const arquivo = event.target.files?.[0];
    event.target.value = ""; // permite reescolher o mesmo arquivo
    processarArquivo(arquivo);
  }

  // Arrastar e soltar uma imagem na área da capa
  function handleDrop(event) {
    event.preventDefault();
    setArrastando(false);
    processarArquivo(event.dataTransfer.files?.[0]);
  }
  function handleDragOver(event) {
    event.preventDefault();
    if (!arrastando) setArrastando(true);
  }
  function handleDragLeave(event) {
    event.preventDefault();
    setArrastando(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!form.titulo.trim()) {
      setErro("Dê um título para o evento.");
      return;
    }
    if (!form.dataHora) {
      setErro("Informe a data e o horário do evento.");
      return;
    }
    if (!form.local.trim()) {
      setErro("Informe o local do evento.");
      return;
    }
    if (form.dataHoraFim && form.dataHora && form.dataHoraFim < form.dataHora) {
      setErro("O término deve ser depois do início.");
      return;
    }

    onSubmit({
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      dataHora: form.dataHora,
      dataHoraFim: form.dataHoraFim,
      local: form.local.trim(),
      senhaAcesso: form.senhaAcesso,
      descricao: form.descricao.trim(),
      capa: capaErro ? "" : capa,
      capaOrig: capaErro ? "" : capaOrig,
      mapaLink: form.mapaLink.trim(),
      playlistLink: form.playlistLink.trim(),
    });
  }

  return (
    <>
    {escolhaCapa && (
      <ImageChoiceModal
        onAdjust={() => {
          // ajusta sobre o original (dá folga pra arrastar); se não houver,
          // cai para a capa recortada atual.
          setAjusteCapa(capaOrig || capa);
          setEscolhaCapa(false);
        }}
        onPick={() => {
          setEscolhaCapa(false);
          inputCapaRef.current?.click();
        }}
        onCancel={() => setEscolhaCapa(false)}
      />
    )}

    {ajusteCapa && (
      <ImageAdjuster
        src={ajusteCapa}
        aspect={16 / 9}
        outputWidth={1280}
        onCancel={() => setAjusteCapa(null)}
        onConfirm={(dataUrl) => {
          setCapaOrig(ajusteCapa); // guarda o original que foi ajustado
          setCapa(dataUrl);
          setAjusteCapa(null);
        }}
      />
    )}

    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20"
    >
      {erro && (
        <div className="rounded-2xl border border-red-500/40 bg-red-900/40 px-4 py-3 text-sm text-red-200">
          {erro}
        </div>
      )}

      {/* CAPA DO EVENTO */}
      <div>
        <label className={labelClass}>Capa do evento</label>
        <p className="mb-3 text-xs text-slate-400">
          Escolha uma imagem que remeta ao tema do evento para facilitar a
          identificação.
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex h-52 w-full items-center justify-center overflow-hidden rounded-3xl border border-dashed bg-slate-950/60 transition ${
            arrastando ? "border-fuchsia-500 bg-fuchsia-500/10" : "border-slate-700"
          }`}
        >
          {capa && !capaErro ? (
            <>
              <img
                src={capa}
                alt="Prévia da capa do evento"
                onError={() => setCapaErro(true)}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setCapa("");
                  setCapaOrig("");
                }}
                className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-950"
              >
                Remover
              </button>
            </>
          ) : capa && capaErro ? (
            <div className="px-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-2xl text-red-300">
                !
              </div>
              <p className="text-sm text-red-300">
                Não foi possível carregar essa imagem
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Use o link direto do arquivo (que termina em .jpg, .png, .webp)
                ou envie uma imagem do seu dispositivo.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCapa("");
                  setCapaOrig("");
                }}
                className="mt-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-950"
              >
                Limpar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={aoClicarEnviar}
              className="flex h-full w-full flex-col items-center justify-center px-6 text-center transition hover:bg-white/5"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/30 via-fuchsia-500/30 to-sky-500/30 text-2xl text-white">
                +
              </div>
              <p className="text-sm text-slate-300">
                Arraste uma imagem aqui ou clique para enviar
              </p>
              <p className="mt-1 text-xs text-slate-500">
                ou cole uma URL abaixo
              </p>
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={aoClicarEnviar}
            className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-90"
          >
            {capaAjustavel ? "Alterar imagem" : "Enviar imagem"}
          </button>
          <input
            ref={inputCapaRef}
            type="file"
            accept="image/*"
            onChange={handleArquivo}
            className="hidden"
          />
          <input
            type="url"
            value={capa.startsWith("data:") ? "" : capa}
            onChange={(event) => {
              setCapa(event.target.value);
              setCapaOrig(""); // link externo não é ajustável
            }}
            className={inputClass}
            placeholder="ou cole o link direto da imagem (.jpg, .png...)"
          />
        </div>
      </div>

      {/* TÍTULO */}
      <div>
        <label htmlFor="titulo" className={labelClass}>
          Título
        </label>
        <input
          id="titulo"
          name="titulo"
          type="text"
          value={form.titulo}
          onChange={handleChange}
          className={inputClass}
          placeholder="Ex.: Noite de Música"
          required
        />
      </div>

      {/* TIPO, INÍCIO E TÉRMINO */}
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="tipo" className={labelClass}>
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className={inputClass}
          >
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo} className="bg-slate-900">
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dataHora" className={labelClass}>
            Início
          </label>
          <input
            id="dataHora"
            name="dataHora"
            type="datetime-local"
            value={form.dataHora}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="dataHoraFim" className={labelClass}>
            Término <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            id="dataHoraFim"
            name="dataHoraFim"
            type="datetime-local"
            value={form.dataHoraFim}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      {/* LOCAL E SENHA */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="local" className={labelClass}>
            Local
          </label>
          <input
            id="local"
            name="local"
            type="text"
            value={form.local}
            onChange={handleChange}
            className={inputClass}
            placeholder="Ex.: Centro Cultural"
            required
          />
        </div>

        <div>
          <label htmlFor="senhaAcesso" className={labelClass}>
            Senha de acesso <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            id="senhaAcesso"
            name="senhaAcesso"
            type="text"
            value={form.senhaAcesso}
            onChange={handleChange}
            className={inputClass}
            placeholder="Para participantes entrarem no evento"
          />
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <div>
        <label htmlFor="descricao" className={labelClass}>
          Descrição <span className="text-slate-500">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Conte um pouco sobre o evento..."
        />
      </div>

      {/* LOCALIZAÇÃO NO MAPA E PLAYLIST (opcional) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="mapaLink" className={labelClass}>
            Localização no mapa <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            id="mapaLink"
            name="mapaLink"
            type="text"
            value={form.mapaLink}
            onChange={handleChange}
            className={inputClass}
            placeholder="Cole o link do Google Maps"
          />
          <p className="mt-2 text-xs text-slate-500">
            Marca o local do evento no mapa. Você também pode adicionar depois.
          </p>
        </div>

        <div>
          <label htmlFor="playlistLink" className={labelClass}>
            Playlist do Spotify <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            id="playlistLink"
            name="playlistLink"
            type="text"
            value={form.playlistLink}
            onChange={handleChange}
            className={inputClass}
            placeholder="Cole o link da playlist do Spotify"
          />
          <p className="mt-2 text-xs text-slate-500">
            Define a trilha sonora do evento. Você também pode trocar depois.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          to={cancelarHref}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-90"
        >
          {textoBotao}
        </button>
      </div>
    </form>
    </>
  );
}
