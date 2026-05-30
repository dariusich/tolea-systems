import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { tradeApi } from "../api.js";
import EquityCurve from "../components/EquityCurve.jsx";

function money(value, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function percent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function accountName(account) {
  return account?.display_name || account?.name || `${account?.platform || ""} ${account?.login || ""}`.trim();
}

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [statsBySlug, setStatsBySlug] = useState({});
  const [equity, setEquity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const accountsData = await tradeApi.accounts();
        const nextAccounts = accountsData.accounts || [];
        const statsEntries = await Promise.all(
          nextAccounts.map(async (account) => {
            try {
              const data = await tradeApi.stats(null, account.slug);
              return [account.slug, data.stats];
            } catch {
              return [account.slug, null];
            }
          })
        );
        const first = nextAccounts[0];
        const equityData = first ? await tradeApi.equity(null, first.slug).catch(() => ({ equity: [] })) : { equity: [] };
        if (active) {
          setAccounts(nextAccounts);
          setStatsBySlug(Object.fromEntries(statsEntries));
          setEquity(equityData.equity || []);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const stats = Object.values(statsBySlug).filter(Boolean);
    const totalProfit = stats.reduce((sum, item) => sum + Number(item.total_profit || 0), 0);
    const totalTrades = stats.reduce((sum, item) => sum + Number(item.number_of_trades || 0), 0);
    const avgWinRate = stats.length ? stats.reduce((sum, item) => sum + Number(item.win_rate || 0), 0) / stats.length : 0;
    const worstDay = stats
      .map((item) => item.worst_day)
      .filter(Boolean)
      .sort((a, b) => Number(a.profit || 0) - Number(b.profit || 0))[0];
    return { totalProfit, totalTrades, avgWinRate, worstDay };
  }, [statsBySlug]);

  const previewAccount = accounts[0];

  return (
    <div className="site-page">
      <header className="site-header">
        <Link className="site-brand" to="/">
          <Activity size={24} />
          <span>Tolea Systems</span>
        </Link>
        <nav className="site-nav" aria-label="Website navigation">
          <a href="#systems">Systems</a>
          <Link to="/live-results">Live Results</Link>
          <a href="#why">Why Us</a>
        </nav>
        <Link className="site-cta" to="/live-results">Open Dashboard</Link>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-dots" />
          <div className="hero-copy">
            <span className="hero-pill"><Sparkles size={14} /> Verified MT4/MT5 performance</span>
            <h1>Professional algorithmic trading systems</h1>
            <p>
              A premium live-results hub for DSys Alpha and DSys Beta, connected directly to your trading VPS and updated from real brokerage accounts.
            </p>
            <div className="hero-actions">
              <Link className="primary-action" to="/live-results">View live results <ArrowRight size={17} /></Link>
              <a className="secondary-action" href="#systems">Explore systems</a>
            </div>
          </div>
          <div className="hero-visual" aria-label="Live trading performance preview">
            <img src="https://static.prod-images.emergentagent.com/jobs/599f84e4-5129-4656-ae03-3aa63667952b/images/393ce11995fd1a36f471633203935b880d230063452f2304e725af3267cfbd94.png" alt="Clean trading analytics chart preview" />
            <div className="hero-visual-card">
              <span>Total closed PnL</span>
              <strong className={summary.totalProfit >= 0 ? "positive" : "negative"}>{money(summary.totalProfit)}</strong>
              <small>{loading ? "Loading live accounts..." : `${accounts.length} connected accounts`}</small>
            </div>
          </div>
        </section>

        <section className="trust-band" aria-label="Supported platforms">
          <span>MetaTrader 4</span>
          <span>MetaTrader 5</span>
          <span>FastAPI</span>
          <span>SQLite</span>
          <span>Render</span>
        </section>

        <section className="site-section">
          <div className="site-section-heading">
            <span>Live overview</span>
            <h2>Transparent account performance.</h2>
          </div>
          <div className="marketing-metrics">
            <Metric label="Connected Accounts" value={accounts.length} icon={Activity} />
            <Metric label="Total Profit" value={money(summary.totalProfit)} tone={summary.totalProfit >= 0 ? "profit" : "loss"} icon={TrendingUp} />
            <Metric label="Win Rate" value={percent(summary.avgWinRate)} icon={BarChart3} />
            <Metric label="Worst Day" value={summary.worstDay ? money(summary.worstDay.profit) : money(0)} tone="loss" icon={TrendingDown} />
          </div>
        </section>

        <section className="site-section live-preview">
          <div>
            <div className="site-section-heading">
              <span>Performance feed</span>
              <h2>{previewAccount ? accountName(previewAccount) : "Waiting for synced accounts"}</h2>
              <p>Equity, PnL calendar, stats and trade details stay on the live dashboard, backed by your collector.</p>
            </div>
            <Link className="inline-link" to="/live-results">Open full dashboard <ArrowRight size={15} /></Link>
          </div>
          <div className="landing-chart-card">
            <EquityCurve data={equity} currency={previewAccount?.currency || "USD"} />
          </div>
        </section>

        <section id="systems" className="site-section">
          <div className="site-section-heading">
            <span>Systems</span>
            <h2>DSys Alpha and DSys Beta.</h2>
          </div>
          <div className="system-grid">
            {["DSys Alpha", "DSys Beta"].map((name, index) => {
              const account = accounts.find((item) => accountName(item) === name);
              const stats = account ? statsBySlug[account.slug] : null;
              return (
                <article className="system-card" key={name}>
                  <span className="system-badge">{index === 0 ? "MT5" : "MT4"}</span>
                  <h3>{name}</h3>
                  <p>{account ? `${account.broker || "Broker"} - ${account.server || "Server"}` : "Connect collector to populate live account details."}</p>
                  <div className="system-stats">
                    <span>Profit <strong className={Number(stats?.total_profit || 0) >= 0 ? "positive" : "negative"}>{money(stats?.total_profit)}</strong></span>
                    <span>Trades <strong>{stats?.number_of_trades || 0}</strong></span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="why" className="site-section why-grid">
          <Why icon={ShieldCheck} title="Verified data" body="Accounts are synced from MT4/MT5 terminals, not edited by hand." />
          <Why icon={CheckCircle2} title="Clean reporting" body="Daily PnL, equity curve, statistics and trade tables in one dashboard." />
          <Why icon={BarChart3} title="Built for scale" body="Collector stays light on the VPS while Render serves the public dashboard." />
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, tone = "neutral", icon: Icon }) {
  return (
    <article className="marketing-card">
      <Icon size={18} />
      <span>{label}</span>
      <strong className={tone === "profit" ? "positive" : tone === "loss" ? "negative" : ""}>{value}</strong>
    </article>
  );
}

function Why({ icon: Icon, title, body }) {
  return (
    <article className="why-card">
      <Icon size={20} />
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
