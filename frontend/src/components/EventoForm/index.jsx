import { useState } from "react";
import { Link } from "react-router-dom";

const TIPOS = [
  "Show",
  "Social",
  "Tecnologia",
  "Outdoor",
  "Entretenimento",
  "Cultural",
  "Outro",
];

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
    local: valorInicial.local || "",
    senhaAcesso: valorInicial.senhaAcesso || "",
    descricao: valorInicial.descricao || "",
  });
  const [capa, setCapa] = useState(valorInicial.capa || "");
  const [capaErro, setCapaErro] = useState(false);
  const [erro, setErro] = useState("");

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

  // Lê o arquivo escolhido e transforma em uma URL de dados (preview + armazenamento)
  function handleArquivo(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setErro("A capa precisa ser um arquivo de imagem.");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => setCapa(leitor.result);
    leitor.readAsDataURL(arquivo);
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

    onSubmit({
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      dataHora: form.dataHora,
      local: form.local.trim(),
      senhaAcesso: form.senhaAcesso,
      descricao: form.descricao.trim(),
      capa: capaErro ? "" : capa,
    });
  }

  return (
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

        <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-700 bg-slate-950/60">
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
                onClick={() => setCapa("")}
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
                onClick={() => setCapa("")}
                className="mt-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-950"
              >
                Limpar
              </button>
            </div>
          ) : (
            <div className="px-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/30 via-fuchsia-500/30 to-sky-500/30 text-2xl text-white">
                +
              </div>
              <p className="text-sm text-slate-300">Nenhuma capa selecionada</p>
              <p className="mt-1 text-xs text-slate-500">
                Envie um arquivo ou cole uma URL abaixo
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-90">
            Enviar imagem
            <input
              type="file"
              accept="image/*"
              onChange={handleArquivo}
              className="hidden"
            />
          </label>
          <input
            type="url"
            value={capa.startsWith("data:") ? "" : capa}
            onChange={(event) => setCapa(event.target.value)}
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

      {/* TIPO E DATA */}
      <div className="grid gap-6 md:grid-cols-2">
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
            Data e horário
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
  );
}
