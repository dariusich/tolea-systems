export default function MetricCard({ label, value, sub, tone = "neutral", icon: Icon, testId }) {
  const toneClass =
    tone === "profit"
      ? "text-emerald-600"
      : tone === "loss"
        ? "text-rose-600"
        : tone === "brand"
          ? "text-[color:var(--color-accent-hover)]"
          : "text-zinc-900";
  return (
    <div
      data-testid={testId}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--color-accent)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-[color:var(--color-accent-hover)]" /> : null}
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}
