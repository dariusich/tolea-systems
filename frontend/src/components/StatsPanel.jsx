function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function statTone(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

export default function StatsPanel({ stats, account }) {
  const currency = account?.currency || "USD";
  const items = [
    { label: "Total PnL", value: money(stats?.total_profit, currency), tone: statTone(stats?.total_profit || 0) },
    { label: "Win Rate", value: `${Number(stats?.win_rate || 0).toFixed(1)}%`, tone: "neutral" },
    { label: "Average RR", value: Number(stats?.average_rr || 0).toFixed(2), tone: "neutral" },
    { label: "Trades", value: stats?.number_of_trades || 0, tone: "neutral" },
    { label: "Best Day", value: stats?.best_day ? money(stats.best_day.profit, currency) : money(0, currency), tone: "positive" },
    { label: "Worst Day", value: stats?.worst_day ? money(stats.worst_day.profit, currency) : money(0, currency), tone: "negative" },
    { label: "Balance", value: money(account?.balance || 0, currency), tone: "neutral" },
    { label: "Equity", value: money(account?.equity || 0, currency), tone: statTone((account?.equity || 0) - (account?.balance || 0)) }
  ];

  return (
    <section className="stats-grid" aria-label="Account statistics">
      {items.map((item) => (
        <article className="stat-card" key={item.label}>
          <span>{item.label}</span>
          <strong className={item.tone}>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}

