export function SettingsSection({ id, titulo, descricao, children }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className="scroll-mt-28 rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/80 p-5 shadow-xl shadow-black/20 sm:p-7"
    >
      <div className="mb-5 border-b border-slate-800/80 pb-4">
        <h2 id={`${id}-titulo`} className="text-xl font-semibold text-white">
          {titulo}
        </h2>
        {descricao && (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">
            {descricao}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SettingRow({
  titulo,
  descricao,
  children,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-100">{titulo}</h3>
        {descricao && (
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {descricao}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? "border-fuchsia-400/50 bg-gradient-to-r from-violet-500 to-fuchsia-500"
          : "border-slate-700 bg-slate-800"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function SettingsInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  max,
  maxLength,
  autoComplete,
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className="min-h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-fuchsia-500 focus-visible:ring-2 focus-visible:ring-fuchsia-500/25 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

export function SettingsSelect({ id, label, value, onChange, options }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="min-h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 outline-none transition hover:border-slate-600 focus-visible:border-fuchsia-500 focus-visible:ring-2 focus-visible:ring-fuchsia-500/25"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SettingsNotice({ children, tipo = "sucesso" }) {
  const classes =
    tipo === "erro"
      ? "border-red-500/40 bg-red-900/30 text-red-200"
      : tipo === "aviso"
        ? "border-amber-500/40 bg-amber-900/20 text-amber-200"
        : "border-emerald-500/30 bg-emerald-900/20 text-emerald-200";
  return (
    <p role={tipo === "erro" ? "alert" : "status"} aria-live="polite" className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>
      {children}
    </p>
  );
}

export function ActionButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 text-white shadow-lg shadow-fuchsia-500/20 hover:opacity-90",
    secondary:
      "border border-slate-700 bg-slate-900/70 text-slate-200 hover:border-fuchsia-500/50 hover:bg-slate-800",
    danger:
      "border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
    >
      {loading ? "Aguarde…" : children}
    </button>
  );
}

export function SettingsOptionCards({ value, onChange, options, ariaLabel }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-11 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${
            value === option.value
              ? "border-fuchsia-400/60 bg-gradient-to-br from-violet-500/20 to-sky-500/20"
              : "border-slate-800/80 bg-slate-950/40 hover:border-slate-700"
          }`}
        >
          <span className="block font-semibold text-white">{option.label}</span>
          {option.description && (
            <span className="mt-1 block text-xs leading-relaxed text-slate-400">
              {option.description}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
