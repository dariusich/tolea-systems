import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { money, percent, number, shortDate } from "@/lib/format";
import { EquityChart, DrawdownChart } from "@/components/Charts";
import MetricCard from "@/components/MetricCard";
import PnLCalendar from "@/components/PnLCalendar";
import PageHelmet from "@/components/PageHelmet";

export default function LiveResults() {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeSlug, setActiveSlug] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [trades, setTrades] = useState([]);
  const [pnlDays, setPnlDays] = useState([]);
  const [tradesTab, setTradesTab] = useState("closed");

  useEffect(() => {
    let alive = true;
    const load = () => {
      api.get("/accounts").then(({ data }) => {
        if (!alive) return;
        const nextAccounts = data.accounts || [];
        setAccounts(nextAccounts);
        setSummary(data.summary);
        setActiveSlug((current) => {
          if (current && nextAccounts.some((account) => account.slug === current)) return current;
          return nextAccounts[0]?.slug || null;
        });
      });
      api.get("/calendar/pnl").then(({ data }) => {
        if (alive) setPnlDays(data.days || []);
      });
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    let alive = true;
    const load = () => {
      api.get(`/accounts/${activeSlug}`).then(({ data }) => {
        if (!alive) return;
        setActiveAccount(data.account);
        setTrades(data.trades || []);
      });
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [activeSlug]);

  const filteredTrades = useMemo(
    () => trades.filter((t) => (tradesTab === "open" ? t.status === "open" : t.status === "closed")),
    [trades, tradesTab]
  );

  return (
    <>
      <PageHelmet title="Live Results" description="Verified live trading performance across active Tolea Systems accounts." />
      <section className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Live results</p>
          <h1 className="font-display mt-2 text-4xl leading-tight text-zinc-900 sm:text-5xl">
            Verified, live, transparent.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
            Streaming performance from connected trading accounts. Every metric you see is sourced from a live brokerage account.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Summary metrics */}
        {summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Active systems" value={number(summary.active_systems)} icon={Activity} testId="live-active-systems" />
            <MetricCard label="Avg monthly gain" value={percent(summary.avg_monthly_gain)} tone="profit" icon={TrendingUp} testId="live-avg-monthly" />
            <MetricCard label="Max drawdown" value={percent(summary.max_drawdown)} tone="loss" icon={TrendingDown} testId="live-max-dd" />
            <MetricCard label="Total profit" value={money(summary.total_profit)} tone="profit" testId="live-total-profit" />
          </div>
        )}

        {/* Account selector */}
        <div className="mt-10 flex flex-wrap gap-2">
          {accounts.map((a) => (
            <button
              key={a.slug}
              type="button"
              onClick={() => setActiveSlug(a.slug)}
              data-testid={`account-tab-${a.slug}`}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                activeSlug === a.slug
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {a.name} <span className="text-xs opacity-70">· {a.platform} {a.login}</span>
            </button>
          ))}
        </div>

        {accounts.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-8 py-16 text-center">
            <p className="text-sm font-medium text-zinc-700">No live accounts synced yet.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Start the VPS collector and this page will populate automatically from real MT4 or MT5 data.
            </p>
          </div>
        )}

        {/* Active account */}
        {activeAccount && (
          <div className="mt-8 space-y-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{activeAccount.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {activeAccount.broker} · {activeAccount.platform} · {activeAccount.system_name}
                    </p>
                  </div>
                  <Link
                    to={`/systems/${activeAccount.system_name?.toLowerCase().replace(/\s+/g, "-")}`}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    View system <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <h3 className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Equity & balance · 90 days</h3>
                <div className="mt-2">
                  <EquityChart data={activeAccount.chart} height={300} />
                </div>
                <h3 className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Drawdown</h3>
                <div className="mt-2">
                  <DrawdownChart data={activeAccount.chart} height={180} />
                </div>
              </div>

              <div className="space-y-3">
                <KVCard label="Balance" value={money(activeAccount.balance)} />
                <KVCard label="Equity" value={money(activeAccount.equity)} />
                <KVCard label="Total gain" value={percent(activeAccount.total_gain)} tone="profit" />
                <KVCard label="Monthly gain" value={percent(activeAccount.monthly_gain)} tone="profit" />
                <KVCard label="Max drawdown" value={percent(activeAccount.drawdown)} tone="loss" />
                <KVCard label="Win rate" value={`${activeAccount.win_rate}%`} />
                <KVCard label="Profit factor" value={activeAccount.profit_factor?.toFixed(2)} />
                <KVCard label="Trades" value={number(activeAccount.trades_count)} />
                <KVCard label="Days active" value={number(activeAccount.days_active)} />
                {activeAccount.myfxbook && <MyfxbookCard myfxbook={activeAccount.myfxbook} />}
              </div>
            </div>

            {/* PnL calendar (aggregate of all accounts) */}
            <PnLCalendar days={pnlDays} />

            {/* Trades */}
            <div className="rounded-2xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-100 p-5">
                <div className="inline-flex rounded-lg bg-zinc-100 p-1 text-sm">
                  <TabBtn active={tradesTab === "closed"} onClick={() => setTradesTab("closed")} testId="trades-tab-closed">
                    Closed trades
                  </TabBtn>
                  <TabBtn active={tradesTab === "open"} onClick={() => setTradesTab("open")} testId="trades-tab-open">
                    Open trades
                  </TabBtn>
                </div>
                <p className="text-xs text-zinc-500">{filteredTrades.length} entries</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead className="bg-zinc-50/60 text-left">
                    <tr className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                      <th className="px-5 py-3 font-medium">Symbol</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                      <th className="px-5 py-3 font-medium">Lots</th>
                      <th className="px-5 py-3 font-medium">Pips</th>
                      <th className="px-5 py-3 font-medium">Profit</th>
                      <th className="px-5 py-3 font-medium">{tradesTab === "open" ? "Opened" : "Closed"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredTrades.slice(0, 30).map((t) => (
                      <tr key={t.id} className="text-zinc-700">
                        <td className="px-5 py-3 font-medium text-zinc-900">{t.symbol}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${tradeActionClass(t)}`}>
                            {t.action}
                          </span>
                        </td>
                        <td className="px-5 py-3">{t.lots.toFixed(2)}</td>
                        <td className="px-5 py-3">{t.pips}</td>
                        <td className={`px-5 py-3 font-medium ${t.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {money(t.profit)}
                        </td>
                        <td className="px-5 py-3 text-zinc-500">
                          {shortDate(tradesTab === "open" ? t.open_time : t.close_time)}
                        </td>
                      </tr>
                    ))}
                    {filteredTrades.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-sm text-zinc-400">
                          No {tradesTab} trades to display.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function KVCard({ label, value, tone }) {
  const cls = tone === "profit" ? "text-emerald-600" : tone === "loss" ? "text-rose-600" : "text-zinc-900";
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-tight ${cls}`}>{value}</p>
    </div>
  );
}

function MyfxbookCard({ myfxbook }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">Myfxbook</p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-900">{myfxbook.label}</p>
        </div>
        <a
          href={myfxbook.profile_url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Open
        </a>
      </div>
      <a href={myfxbook.profile_url} target="_blank" rel="noreferrer" className="block bg-zinc-50 p-3">
        <img
          src="https://widget.myfxbook.com/widget/widget.png?accountOid=12049164&type=6"
          alt="DSys Beta Myfxbook verification"
          className="h-auto max-h-40 w-full rounded-md object-contain"
          loading="lazy"
        />
      </a>
    </div>
  );
}

function tradeActionClass(trade) {
  if (trade.action === "Buy") return "bg-emerald-50 text-emerald-700";
  if (trade.action === "Sell") return "bg-rose-50 text-rose-700";
  return trade.profit >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600";
}

function TabBtn({ active, onClick, children, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}
