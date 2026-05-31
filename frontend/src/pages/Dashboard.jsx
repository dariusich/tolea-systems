import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ExternalLink,
  FileText,
  Home,
  LineChart,
  PackageOpen,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { tradeApi } from "../api.js";
import CalendarPnL from "../components/CalendarPnL.jsx";
import EquityCurve from "../components/EquityCurve.jsx";
import StatsPanel from "../components/StatsPanel.jsx";
import TradesTable from "../components/TradesTable.jsx";

const RISK_DISCLAIMER = "Trading involves risk. Past performance does not guarantee future results.";

function money(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function compactMoney(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    notation: "compact",
    maximumFractionDigits: 1,
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

function accountLabel(account) {
  if (!account) return "";
  const display = account.display_name || account.name || `${account.platform} ${account.login}`;
  return `${display} - ${account.platform} ${account.login}`;
}

export default function Dashboard() {
  const { token, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [account, setAccount] = useState(null);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState([]);
  const [tradesByDay, setTradesByDay] = useState({});
  const [equity, setEquity] = useState([]);
  const [trades, setTrades] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  const isShareHub = Boolean(token && !slug && location.pathname.startsWith("/share"));
  const isAccountsHub = location.pathname === "/accounts" || isShareHub;
  const activeSlug = slug || selectedSlug;

  const accountPath = useCallback(
    (accountSlug) => {
      if (token) return `/share/${token}/a/${accountSlug}`;
      if (location.pathname.startsWith("/live-results")) return `/live-results/a/${accountSlug}`;
      return `/a/${accountSlug}`;
    },
    [location.pathname, token]
  );

  const loadAccounts = useCallback(async () => {
    const accountsData = await tradeApi.accounts(token);
    const nextAccounts = accountsData.accounts || [];
    setAccounts(nextAccounts);
    setLastRefresh(new Date());
    setSelectedSlug((current) => {
      if (slug) return slug;
      if (isAccountsHub) return null;
      if (current && nextAccounts.some((item) => item.slug === current)) return current;
      return nextAccounts[0]?.slug || null;
    });
  }, [isAccountsHub, slug, token]);

  useEffect(() => {
    let active = true;
    const safeLoad = async () => {
      try {
        await loadAccounts();
        if (active) {
          setError("");
          setLoadingAccounts(false);
        }
      } catch (exc) {
        if (active) {
          setError(exc.message);
          setLoadingAccounts(false);
        }
      }
    };
    void safeLoad();
    const interval = setInterval(safeLoad, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [loadAccounts]);

  useEffect(() => {
    if (!activeSlug || isAccountsHub) {
      setAccount(null);
      setStats(null);
      setDays([]);
      setTradesByDay({});
      setEquity([]);
      setTrades([]);
      return;
    }

    let active = true;
    const safeLoad = async () => {
      setLoadingAccount(true);
      try {
        const [accountData, statsData, dailyData, equityData, tradesData] = await Promise.all([
          tradeApi.account(token, activeSlug),
          tradeApi.stats(token, activeSlug),
          tradeApi.dailyPnl(token, activeSlug),
          tradeApi.equity(token, activeSlug),
          tradeApi.trades(token, activeSlug),
        ]);
        if (!active) return;
        setAccount(accountData.account);
        setStats(statsData.stats);
        setDays(dailyData.days || []);
        setTradesByDay(dailyData.tradesByDay || {});
        setEquity(equityData.equity || []);
        setTrades(tradesData.trades || []);
        setError("");
        setLastRefresh(new Date());
      } catch (exc) {
        if (active) setError(exc.message);
      } finally {
        if (active) setLoadingAccount(false);
      }
    };
    void safeLoad();
    const interval = setInterval(safeLoad, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeSlug, isAccountsHub, token]);

  const accountCurrency = account?.currency || "USD";
  const selectedTrades = useMemo(() => {
    if (!selectedDate) return trades;
    return trades.filter((trade) => trade.close_time?.slice(0, 10) === selectedDate);
  }, [selectedDate, trades]);
  const dayProfit = selectedTrades.reduce((sum, trade) => sum + net(trade), 0);
  const recentTrades = useMemo(() => (selectedDate ? selectedTrades : trades.slice(0, 8)), [selectedDate, selectedTrades, trades]);
  const symbolPerformance = useMemo(() => groupBySymbol(trades), [trades]);

  const handleAccountChange = (nextSlug) => {
    setSelectedSlug(nextSlug);
    navigate(accountPath(nextSlug));
  };

  if (loadingAccounts) {
    return (
      <Shell lastRefresh={lastRefresh} accounts={accounts} account={account} onAccountChange={handleAccountChange}>
        <div className="loading-block">Loading Tolea Systems...</div>
      </Shell>
    );
  }

  if (error && !account) {
    return (
      <Shell lastRefresh={lastRefresh} accounts={accounts} account={account} onAccountChange={handleAccountChange}>
        <div className="error-panel">{error}</div>
      </Shell>
    );
  }

  if (isAccountsHub) {
    return (
      <Shell lastRefresh={lastRefresh} accounts={accounts} account={account} onAccountChange={handleAccountChange}>
        <AccountOverview accounts={accounts} token={token} />
      </Shell>
    );
  }

  if (!accounts.length) {
    return (
      <Shell lastRefresh={lastRefresh} accounts={accounts} account={account} onAccountChange={handleAccountChange}>
        <section className="empty-state">
          <Server size={34} />
          <h1>No accounts synced yet.</h1>
          <p>The dashboard will populate as soon as the VPS collector sends real MT4 or MT5 data.</p>
        </section>
      </Shell>
    );
  }

  return (
    <Shell lastRefresh={lastRefresh} accounts={accounts} account={account} onAccountChange={handleAccountChange}>
      <div className="dashboard-title">
        <div>
          <h1>Overview</h1>
          <p>Your trading performance at a glance</p>
        </div>
        <Link className="soft-link" to="/accounts">All accounts</Link>
      </div>

      {loadingAccount && !account ? (
        <div className="loading-block">Loading account performance...</div>
      ) : (
        <>
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

          <div className="bottom-grid">
            <div className="side-stack">
              <section className="day-drilldown">
                <div>
                  <span className="eyebrow">{selectedDate || "All closed trades"}</span>
                  <h2 className={dayProfit >= 0 ? "positive" : "negative"}>{money(dayProfit, accountCurrency)}</h2>
                </div>
                {selectedDate && <button type="button" onClick={() => setSelectedDate(null)}>Clear day</button>}
              </section>
              <TradesTable
                trades={recentTrades}
                currency={accountCurrency}
                title={selectedDate ? `Trades on ${selectedDate}` : "Recent Trades"}
                totalCount={selectedDate ? selectedTrades.length : trades.length}
                limit={8}
              />
            </div>
            <div className="side-stack">
              <SymbolPerformance symbols={symbolPerformance} currency={accountCurrency} />
            </div>
          </div>

          <p className="risk-disclaimer">{RISK_DISCLAIMER}</p>
        </>
      )}
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
          <NavItem to="/" icon={Home} label="Overview" />
          <NavItem to="/live-results" icon={Activity} label="Live Results" />
          <NavItem to="/systems" icon={PackageOpen} label="Products" />
          <NavItem to="/live-results" icon={CalendarDays} label="Calendar" />
          <NavItem to="/live-results" icon={LineChart} label="Trades" />
          <NavItem to="/live-results" icon={BarChart3} label="Analytics" />
          <NavItem to="/accounts" icon={WalletCards} label="Accounts" />
          <NavItem to="/account" icon={Settings} label="Settings" />
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
                    {accountLabel(item)}
                  </option>
                ))}
              </select>
            )}
            <div className="refresh-status">
              <span className="status-dot" />
              <span>{accounts.length ? `${accounts.length} connected` : "Waiting"}</span>
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

function NavItem({ to, icon: Icon, label }) {
  const location = useLocation();
  const active = to === "/" ? ["/", "/a"].some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`)) : location.pathname.startsWith(to);
  return (
    <Link to={to} className={`nav-item ${active ? "active" : ""}`}>
      <Icon size={17} />
      {label}
    </Link>
  );
}

function AccountOverview({ accounts, token }) {
  const navigate = useNavigate();

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
        {accounts.map((item) => (
          <button
            className="account-card"
            key={item.account_id}
            type="button"
            onClick={() => navigate(token ? `/share/${token}/a/${item.slug}` : `/a/${item.slug}`)}
          >
            <span className="account-platform">{item.platform}</span>
            <ExternalLink size={18} />
            <div>
              <h2>{item.display_name || item.name}</h2>
              <p>{item.broker || "Broker unavailable"} / {item.server || "Server unavailable"}</p>
            </div>
            <div className="account-card-metrics">
              <span>Balance <strong>{money(item.balance, item.currency)}</strong></span>
              <span>Equity <strong>{money(item.equity, item.currency)}</strong></span>
              <span>Floating <strong className={Number(item.floating_pl || 0) >= 0 ? "positive" : "negative"}>{money(item.floating_pl, item.currency)}</strong></span>
            </div>
            <small>Last sync {relativeTime(item.last_sync_at)}</small>
          </button>
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
