export default function MetricCard({ label, value, sub, tone = "neutral", icon: Icon, testId }) {
  const toneClass =
    tone === "profit"
      ? "text-emerald-600"
      : tone === "loss"
        ? "text-rose-600"
        : tone === "brand"
          ? "text-blue-600"
          : "text-zinc-900";
  return (
    <div
      data-testid={testId}
      className="rounded-xl border border-zinc-200 bg-white p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-zinc-400" /> : null}
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-zinc-500">{sub}</p> : null}
    </div>
  );
}
