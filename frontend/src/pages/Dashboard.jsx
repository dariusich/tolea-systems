import { Activity, ExternalLink, RefreshCw, Server } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { tradeApi } from "../api.js";
import CalendarPnL from "../components/CalendarPnL.jsx";
import EquityCurve from "../components/EquityCurve.jsx";
import StatsPanel from "../components/StatsPanel.jsx";
import TradesTable from "../components/TradesTable.jsx";

function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function relativeTime(value) {
  if (!value) return "Never";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function net(trade) {
  return Number(trade.net_profit ?? trade.profit + trade.swap + trade.commission);
}

export default function Dashboard() {
  const { token, slug } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState(null);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState([]);
  const [tradesByDay, setTradesByDay] = useState({});
  const [equity, setEquity] = useState([]);
  const [trades, setTrades] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setError("");
    if (!slug) {
      const data = await tradeApi.accounts(token);
      setAccounts(data.accounts || []);
      setAccount(null);
    } else {
      const [accountData, statsData, dailyData, equityData, tradesData] = await Promise.all([
        tradeApi.account(token, slug),
        tradeApi.stats(token, slug),
        tradeApi.dailyPnl(token, slug),
        tradeApi.equity(token, slug),
        tradeApi.trades(token, slug)
      ]);
      setAccount(accountData.account);
      setStats(statsData.stats);
      setDays(dailyData.days || []);
      setTradesByDay(dailyData.tradesByDay || {});
      setEquity(equityData.equity || []);
      setTrades(tradesData.trades || []);
    }
    setLastRefresh(new Date());
    setLoading(false);
  }, [slug, token]);

  useEffect(() => {
    let active = true;
    const safeLoad = async () => {
      try {
        await load();
      } catch (exc) {
        if (active) {
          setError(exc.message);
          setLoading(false);
        }
      }
    };
    void safeLoad();
    const interval = setInterval(safeLoad, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [load]);

  const selectedTrades = useMemo(() => {
    if (!selectedDate) return trades;
    return trades.filter((trade) => trade.close_time?.slice(0, 10) === selectedDate);
  }, [selectedDate, trades]);

  if (loading) {
    return (
      <main className="app-shell">
        <div className="loading-block">Loading Tolea Systems...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-shell">
        <Header lastRefresh={lastRefresh} />
        <div className="error-panel">{error}</div>
      </main>
    );
  }

  if (!slug) {
    return (
      <main className="app-shell">
        <Header lastRefresh={lastRefresh} />
        <AccountOverview accounts={accounts} token={token} />
      </main>
    );
  }

  const dayProfit = selectedTrades.reduce((sum, trade) => sum + net(trade), 0);
  const accountCurrency = account?.currency || "USD";

  return (
    <main className="app-shell">
      <Header lastRefresh={lastRefresh} />
      <div className="detail-topbar">
        <Link to={token ? `/share/${token}` : "/"}>Accounts</Link>
        <span>/</span>
        <strong>{account?.display_name || account?.name}</strong>
      </div>

      <section className="account-hero">
        <div>
          <span className="eyebrow">{account?.platform} / {account?.server || "Unknown server"}</span>
          <h1>{account?.display_name || account?.name}</h1>
          <p>{account?.broker || "Broker unavailable"} · Login {account?.login}</p>
        </div>
        <div className="hero-metrics">
          <Metric label="Balance" value={money(account?.balance, accountCurrency)} />
          <Metric label="Equity" value={money(account?.equity, accountCurrency)} />
          <Metric label="Floating" value={money(account?.floating_pl, accountCurrency)} tone={Number(account?.floating_pl || 0) >= 0 ? "positive" : "negative"} />
        </div>
      </section>

      <StatsPanel stats={stats} account={account} />

      <div className="main-grid">
        <CalendarPnL
          days={days}
          tradesByDay={tradesByDay}
          currency={accountCurrency}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <EquityCurve data={equity} currency={accountCurrency} />
      </div>

      <section className="day-drilldown">
        <div>
          <span className="eyebrow">{selectedDate || "All closed trades"}</span>
          <h2>{money(dayProfit, accountCurrency)}</h2>
        </div>
        {selectedDate && <button type="button" onClick={() => setSelectedDate(null)}>Clear day</button>}
      </section>

      <TradesTable
        trades={selectedTrades}
        currency={accountCurrency}
        title={selectedDate ? `Trades on ${selectedDate}` : "All Closed Trades"}
      />
    </main>
  );
}

function Header({ lastRefresh }) {
  return (
    <header className="app-header">
      <div>
        <span className="brand-mark"><Activity size={18} /> Tolea Systems</span>
        <p>Real account data, local-first storage, read-only cloud views.</p>
      </div>
      <div className="refresh-status">
        <RefreshCw size={16} />
        <span>{lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : "Waiting for data"}</span>
      </div>
    </header>
  );
}

function Metric({ label, value, tone = "neutral" }) {
  return (
    <div className="hero-metric">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function AccountOverview({ accounts, token }) {
  if (!accounts.length) {
    return (
      <section className="empty-state">
        <Server size={28} />
        <h1>No accounts synced yet.</h1>
        <p>The dashboard will populate as soon as the collector receives real MT4 or MT5 data.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="section-heading account-list-heading">
        <h1>Accounts</h1>
        <span>{accounts.length} connected</span>
      </div>
      <div className="account-grid">
        {accounts.map((account) => (
          <Link className="account-card" to={token ? `/share/${token}/a/${account.slug}` : `/a/${account.slug}`} key={account.account_id}>
            <span className="account-platform">{account.platform}</span>
            <div>
              <h2>{account.display_name || account.name}</h2>
              <p>{account.broker || "Broker unavailable"} · {account.server || "Server unavailable"}</p>
            </div>
            <div className="account-card-metrics">
              <span>Equity <strong>{money(account.equity, account.currency)}</strong></span>
              <span>Floating <strong className={Number(account.floating_pl || 0) >= 0 ? "positive" : "negative"}>{money(account.floating_pl, account.currency)}</strong></span>
            </div>
            <small>Last sync {relativeTime(account.last_sync_at)}</small>
            <ExternalLink size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}
