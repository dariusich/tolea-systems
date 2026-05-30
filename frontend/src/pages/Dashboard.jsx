import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ExternalLink,
  FileText,
  Home,
  LineChart,
  RefreshCw,
  Server,
  Settings,
  WalletCards
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function compactMoney(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    notation: "compact",
    maximumFractionDigits: 1
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
  return Number(trade.net_profit ?? Number(trade.profit || 0) + Number(trade.swap || 0) + Number(trade.commission || 0));
}

export default function Dashboard() {
  const { token, slug } = useParams();
  const navigate = useNavigate();
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

  const accountPath = useCallback((accountSlug) => (token ? `/share/${token}/a/${accountSlug}` : `/a/${accountSlug}`), [token]);
  const accountsPath = token ? `/share/${token}` : "/";

  const load = useCallback(async () => {
    setError("");
    const accountsData = await tradeApi.accounts(token);
    const nextAccounts = accountsData.accounts || [];
    setAccounts(nextAccounts);

    if (!slug) {
      setAccount(null);
      setStats(null);
      setDays([]);
      setTradesByDay({});
      setEquity([]);
      setTrades([]);
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

  const accountCurrency = account?.currency || "USD";
  const selectedTrades = useMemo(() => {
    if (!selectedDate) return trades;
    return trades.filter((trade) => trade.close_time?.slice(0, 10) === selectedDate);
  }, [selectedDate, trades]);
  const dayProfit = selectedTrades.reduce((sum, trade) => sum + net(trade), 0);
  const recentTrades = useMemo(() => [...trades].slice(0, 6), [trades]);
  const symbolPerformance = useMemo(() => groupBySymbol(trades), [trades]);

  if (loading) {
    return (
      <Shell lastRefresh={lastRefresh}>
        <div className="loading-block">Loading Tolea Systems...</div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell lastRefresh={lastRefresh}>
        <div className="error-panel">{error}</div>
      </Shell>
    );
  }

  if (!slug) {
    return (
      <Shell lastRefresh={lastRefresh}>
        <AccountOverview accounts={accounts} token={token} />
      </Shell>
    );
  }

  return (
    <Shell lastRefresh={lastRefresh} accounts={accounts} account={account} onAccountChange={(nextSlug) => navigate(accountPath(nextSlug))}>
      <div className="dashboard-title">
        <div>
          <h1>Overview</h1>
          <p>Your trading performance at a glance</p>
        </div>
        <Link className="soft-link" to={accountsPath}>All accounts</Link>
      </div>

      <StatsPanel stats={stats} account={account} />

      <div className="dashboard-grid">
        <EquityCurve data={equity} currency={accountCurrency} />
        <CalendarPnL
          days={days}
          tradesByDay={tradesByDay}
          currency={accountCurrency}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      <section className="day-drilldown">
        <div>
          <span className="eyebrow">{selectedDate || "All closed trades"}</span>
          <h2 className={dayProfit >= 0 ? "positive" : "negative"}>{money(dayProfit, accountCurrency)}</h2>
        </div>
        {selectedDate && <button type="button" onClick={() => setSelectedDate(null)}>Clear day</button>}
      </section>

      <div className="bottom-grid">
        <TradesTable
          trades={selectedDate ? selectedTrades : recentTrades}
          currency={accountCurrency}
          title={selectedDate ? `Trades on ${selectedDate}` : "Recent Trades"}
        />
        <SymbolPerformance symbols={symbolPerformance} currency={accountCurrency} />
      </div>
    </Shell>
  );
}

function Shell({ children, lastRefresh, accounts = [], account = null, onAccountChange }) {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Link className="sidebar-brand" to="/">
          <span className="logo-pulse"><Activity size={24} /></span>
          <span>
            <strong>Tolea Systems</strong>
            <small>Trading Dashboard</small>
          </span>
        </Link>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <NavItem active icon={Home} label="Overview" />
          <NavItem icon={CalendarDays} label="Calendar" />
          <NavItem icon={LineChart} label="Trades" />
          <NavItem icon={BarChart3} label="Analytics" />
          <NavItem icon={FileText} label="Reports" />
          <NavItem icon={WalletCards} label="Accounts" />
          <NavItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      <main className="app-shell">
        <header className="app-header">
          <div className="header-spacer" />
          <div className="header-actions">
            {accounts.length > 0 && account && (
              <select className="account-select" value={account.slug} onChange={(event) => onAccountChange?.(event.target.value)}>
                {accounts.map((item) => (
                  <option key={item.account_id} value={item.slug}>
                    {item.platform} {item.login}
                  </option>
                ))}
              </select>
            )}
            <div className="refresh-status">
              <span className="status-dot" />
              <span>{accounts.length || account ? `${accounts.length || 1} connected` : "Waiting"}</span>
            </div>
            <button className="icon-button" type="button" title={lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : "Waiting for data"}>
              <RefreshCw size={16} />
            </button>
            <button className="icon-button" type="button" title="Notifications">
              <Bell size={16} />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }) {
  return (
    <span className={`nav-item ${active ? "active" : ""}`}>
      <Icon size={17} />
      {label}
    </span>
  );
}

function AccountOverview({ accounts, token }) {
  if (!accounts.length) {
    return (
      <section className="empty-state">
        <Server size={34} />
        <h1>No accounts synced yet.</h1>
        <p>The dashboard will populate as soon as the VPS collector sends real MT4 or MT5 data.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="dashboard-title">
        <div>
          <h1>Accounts</h1>
          <p>Select an account to open the PnL calendar, equity curve, and trade details.</p>
        </div>
      </div>
      <div className="account-grid">
        {accounts.map((account) => (
          <Link className="account-card" to={token ? `/share/${token}/a/${account.slug}` : `/a/${account.slug}`} key={account.account_id}>
            <span className="account-platform">{account.platform}</span>
            <ExternalLink size={18} />
            <div>
              <h2>{account.display_name || account.name}</h2>
              <p>{account.broker || "Broker unavailable"} / {account.server || "Server unavailable"}</p>
            </div>
            <div className="account-card-metrics">
              <span>Balance <strong>{money(account.balance, account.currency)}</strong></span>
              <span>Equity <strong>{money(account.equity, account.currency)}</strong></span>
              <span>Floating <strong className={Number(account.floating_pl || 0) >= 0 ? "positive" : "negative"}>{money(account.floating_pl, account.currency)}</strong></span>
            </div>
            <small>Last sync {relativeTime(account.last_sync_at)}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SymbolPerformance({ symbols, currency }) {
  const max = Math.max(...symbols.map((item) => Math.abs(item.profit)), 1);

  return (
    <section className="symbol-panel">
      <div className="section-heading">
        <h2>Performance by Symbol</h2>
        <span>Last synced data</span>
      </div>
      {!symbols.length ? (
        <div className="empty-panel">No symbol performance yet.</div>
      ) : (
        <div className="symbol-list">
          {symbols.slice(0, 6).map((item) => (
            <div className="symbol-row" key={item.symbol}>
              <span className="symbol-badge">{item.symbol.slice(0, 2)}</span>
              <strong>{item.symbol}</strong>
              <div className="symbol-bar">
                <span className={item.profit >= 0 ? "bar-positive" : "bar-negative"} style={{ width: `${Math.max(8, (Math.abs(item.profit) / max) * 100)}%` }} />
              </div>
              <span className={item.profit >= 0 ? "positive" : "negative"}>{compactMoney(item.profit, currency)}</span>
              <small>{item.trades}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function groupBySymbol(trades) {
  const grouped = new Map();
  for (const trade of trades) {
    const symbol = trade.symbol || "UNKNOWN";
    const current = grouped.get(symbol) || { symbol, profit: 0, trades: 0 };
    current.profit += net(trade);
    current.trades += 1;
    grouped.set(symbol, current);
  }
  return [...grouped.values()].sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit));
}
