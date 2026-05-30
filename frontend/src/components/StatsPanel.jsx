import { Calculator, Target, TrendingDown, TrendingUp, Trophy, WalletCards } from "lucide-react";

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
    { label: "Total Profit", value: money(stats?.total_profit, currency), tone: statTone(stats?.total_profit || 0), icon: TrendingUp, meta: "net closed PnL" },
    { label: "Win Rate", value: `${Number(stats?.win_rate || 0).toFixed(1)}%`, tone: "neutral", icon: Target, meta: `${stats?.wins || 0} wins / ${stats?.losses || 0} losses` },
    { label: "Total Trades", value: stats?.number_of_trades || 0, tone: "neutral", icon: Calculator, meta: "closed positions" },
    { label: "Profit Factor", value: Number(stats?.average_rr || 0).toFixed(2), tone: "neutral", icon: WalletCards, meta: "avg win / avg loss" },
    { label: "Best Day", value: stats?.best_day ? money(stats.best_day.profit, currency) : money(0, currency), tone: "positive", icon: Trophy, meta: stats?.best_day?.date || "No winning day" },
    { label: "Worst Day", value: stats?.worst_day ? money(stats.worst_day.profit, currency) : money(0, currency), tone: "negative", icon: TrendingDown, meta: stats?.worst_day?.date || "No losing day" }
  ];

  return (
    <section className="stats-grid" aria-label="Account statistics">
      {items.map((item) => (
        <article className="stat-card" key={item.label}>
          <div className={`stat-icon ${item.tone}`}>
            <item.icon size={18} />
          </div>
          <div>
            <span>{item.label}</span>
            <strong className={item.tone}>{item.value}</strong>
            <small>{item.meta}</small>
          </div>
        </article>
      ))}
    </section>
  );
}
