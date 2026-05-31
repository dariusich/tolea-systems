import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { money, percent } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";

export default function Compare() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data.products));
  }, []);

  const tradeable = products.filter((p) => p.kind === "ea");

  const ROWS = [
    { label: "Strategy", get: (p) => p.strategy_type },
    { label: "Symbols", get: (p) => p.symbols.join(", ") },
    { label: "Timeframe", get: (p) => p.timeframe },
    { label: "Platform", get: (p) => p.platform.join(" / ") },
    { label: "Min deposit", get: (p) => money(p.min_deposit) },
    { label: "Recommended leverage", get: (p) => p.recommended_leverage },
    { label: "Risk level", get: (p) => p.risk_level },
    { label: "Monthly return", get: (p) => percent(p.monthly_return), tone: "profit" },
    { label: "Max drawdown", get: (p) => percent(p.drawdown), tone: "loss" },
    { label: "Win rate", get: (p) => `${p.win_rate}%` },
    { label: "Profit factor", get: (p) => p.profit_factor?.toFixed(2) },
    { label: "Price", get: (p) => money(p.price) },
  ];

  return (
    <>
      <PageHelmet title="Comparison" description="Compare professional algorithmic trading systems side by side." />
      <section className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Comparison</p>
          <h1 className="font-display mt-2 text-4xl leading-tight text-zinc-900 sm:text-5xl">
            Compare systems, side by side.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
            A direct, no-marketing-speak view of strategy, platform, risk and verified performance for every tradeable system on Tolea.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" data-testid="compare-table">
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left">
                <th className="sticky left-0 w-44 bg-white px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Specification
                </th>
                {tradeable.map((p) => (
                  <th key={p.slug} className="px-5 py-5 text-left align-top">
                    <Link to={`/systems/${p.slug}`} className="text-sm font-semibold text-zinc-900 hover:text-[color:var(--color-accent-hover)]">
                      {p.name}
                    </Link>
                    <p className="mt-1 max-w-[16ch] text-xs text-zinc-500">{p.strategy_type}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <th className="sticky left-0 bg-white px-5 py-4 text-left text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                    {row.label}
                  </th>
                  {tradeable.map((p) => (
                    <td
                      key={p.slug}
                      className={`px-5 py-4 align-top text-sm ${
                        row.tone === "profit"
                          ? "text-emerald-600"
                          : row.tone === "loss"
                            ? "text-rose-600"
                            : "text-zinc-800"
                      }`}
                    >
                      {row.get(p) || "—"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="sticky left-0 bg-white px-5 py-5 text-left" />
                {tradeable.map((p) => (
                  <td key={p.slug} className="px-5 py-5">
                    <Link
                      to={`/systems/${p.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
                      data-testid={`compare-cta-${p.slug}`}
                    >
                      View system
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
