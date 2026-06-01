import {
  Activity,
  Bell,
  ExternalLink,
  Home,
  PackageOpen,
  RefreshCw,
  Server,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
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
  return `${display} - ${account.platform} ${account.login} - ${account.results_label || (isMyfxbookAccount(account) ? "Myfxbook Results" : "Live Results")}`;
}

function accountResultSource(account) {
  return account?.resultSource || account?.result_source || (account?.platform === "MT4" ? "myfxbook" : "liveCollector");
}

function isMyfxbookAccount(account) {
  return accountResultSource(account) === "myfxbook" || account?.platform === "MT4";
}

function isLiveCollectorAccount(account) {
  return !isMyfxbookAccount(account);
}

function myfxbookForAccount(account) {
  if (account?.myfxbook) return account.myfxbook;
  if (account?.platform === "MT4" && String(account?.login) === "35115307") {
    return {
      profile_url: "https://www.myfxbook.com/members/dariusch/dsys-beta/12049164",
      widget_url: "https://widget.myfxbook.com/widget/widget.png?accountOid=12049164&type=6",
      label: "DSys Beta verified profile",
    };
  }
  return null;
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
  const [products, setProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  const isShareHub = Boolean(token && !slug && location.pathname.startsWith("/share"));
  const isAccountsHub = location.pathname === "/accounts" || isShareHub;
  const isLiveResultsHub = location.pathname === "/live-results" && !slug && !token;
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
      if (isAccountsHub || isLiveResultsHub) return null;
      if (current && nextAccounts.some((item) => item.slug === current)) return current;
      return nextAccounts[0]?.slug || null;
    });
  }, [isAccountsHub, isLiveResultsHub, slug, token]);

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
    if (!activeSlug || isAccountsHub || isLiveResultsHub) {
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
        const accountData = await tradeApi.account(token, activeSlug);
        if (!active) return;
        const nextAccount = accountData.account;
        setAccount(nextAccount);
        if (isMyfxbookAccount(nextAccount)) {
          setStats(null);
          setDays([]);
          setTradesByDay({});
          setEquity([]);
          setTrades([]);
          setSelectedDate(null);
          setError("");
          setLastRefresh(new Date());
          return;
        }
        const [statsData, dailyData, equityData, tradesData] = await Promise.all([
          tradeApi.stats(token, activeSlug),
          tradeApi.dailyPnl(token, activeSlug),
          tradeApi.equity(token, activeSlug),
          tradeApi.trades(token, activeSlug),
        ]);
        if (!active) return;
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
  }, [activeSlug, isAccountsHub, isLiveResultsHub, token]);

  useEffect(() => {
    if (!isLiveResultsHub) return;
    let active = true;
    api
      .get("/products")
      .then(({ data }) => {
        if (active) setProducts(data.products || []);
      })
      .catch(() => {
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, [isLiveResultsHub]);

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

  if (isLiveResultsHub) {
    return (
      <Shell lastRefresh={lastRefresh} accounts={accounts} account={account} onAccountChange={handleAccountChange}>
        <LiveResultsHub products={products} accounts={accounts} />
      </Shell>
    );
  }

  if (!accounts.length) {
    return (
      <Shell lastRefresh={lastRefresh} accounts={accounts} account={account} onAccountChange={handleAccountChange}>
        <section className="empty-state">
          <Server size={34} />
          <h1>No accounts synced yet.</h1>
          <p>MT5 live dashboards populate as soon as the VPS collector sends data. MT4 products use Myfxbook result links.</p>
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
          {account && isMyfxbookAccount(account) ? (
            <MyfxbookOnlyDashboard account={account} />
          ) : (
            <>
              <StatsPanel stats={stats} account={account} />

              <div className="dashboard-grid" id="calendar">
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
                <div className="side-stack" id="trades">
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
                <div className="side-stack" id="analytics">
                  <SymbolPerformance symbols={symbolPerformance} currency={accountCurrency} />
                </div>
              </div>

              <p className="risk-disclaimer">{RISK_DISCLAIMER}</p>
            </>
          )}
        </>
      )}
    </Shell>
  );
}

function Shell({ children, lastRefresh, accounts = [], account = null, onAccountChange }) {
  const liveCount = accounts.filter(isLiveCollectorAccount).length;

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
          <NavItem to="/systems" icon={PackageOpen} label="Products" />
          <NavItem to="/live-results" icon={Activity} label="Live Results" />
          <NavItem to="/contact" icon={ExternalLink} label="Contact" />
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
              <span>{liveCount ? `${liveCount} MT5 live` : "MT5 waiting"}</span>
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
        <p>MT5 live dashboards populate after the VPS collector sends data. MT4 products use Myfxbook result links.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="dashboard-title">
        <div>
          <h1>Accounts</h1>
          <p>Select an MT5 account for live analytics, or open MT4 result verification via Myfxbook.</p>
        </div>
      </div>
      <div className="account-grid">
        {accounts.map((item) => {
          const myfxbookOnly = isMyfxbookAccount(item);
          return (
            <div className="account-block" key={item.account_id}>
              <button
                className="account-card"
                type="button"
                onClick={() => navigate(token ? `/share/${token}/a/${item.slug}` : `/a/${item.slug}`)}
              >
                <span className={myfxbookOnly ? "account-platform account-platform-gold" : "account-platform"}>{item.platform}</span>
                <ExternalLink size={18} />
                <div>
                  <h2>{item.display_name || item.name}</h2>
                  <p>{item.broker || "Broker unavailable"} / {item.server || "Server unavailable"}</p>
                </div>
                {myfxbookOnly ? (
                  <div className="result-source-note">
                    <strong>MT4 + Myfxbook Results</strong>
                    <span>Internal live sync is disabled for MT4 accounts.</span>
                  </div>
                ) : (
                  <div className="account-card-metrics">
                    <span>Balance <strong>{money(item.balance, item.currency)}</strong></span>
                    <span>Equity <strong>{money(item.equity, item.currency)}</strong></span>
                    <span>Floating <strong className={Number(item.floating_pl || 0) >= 0 ? "positive" : "negative"}>{money(item.floating_pl, item.currency)}</strong></span>
                  </div>
                )}
                <small>{myfxbookOnly ? "Results via Myfxbook" : `Last sync ${relativeTime(item.last_sync_at)}`}</small>
              </button>
              {myfxbookOnly && <AccountMyfxbookPanel account={item} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LiveResultsHub({ products, accounts }) {
  const visibleProducts = products.length ? products.slice(0, 3) : [];

  return (
    <section className="live-results-hub">
      <div className="dashboard-title live-results-title">
        <div>
          <h1>Live Results</h1>
          <p>Verified result cards for each system. MT4 uses Myfxbook, while MT5 live accounts can open the internal dashboard.</p>
        </div>
        <Link className="soft-link" to="/systems">View Products</Link>
      </div>

      {visibleProducts.length ? (
        <div className="live-results-grid">
          {visibleProducts.map((product) => (
            <LiveResultCard key={product.slug} product={product} account={accountForProduct(product, accounts)} />
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <PackageOpen size={34} />
          <h1>Results are loading.</h1>
          <p>The product result cards will appear as soon as the site API responds.</p>
        </section>
      )}

      <p className="risk-disclaimer">{RISK_DISCLAIMER}</p>
    </section>
  );
}

function LiveResultCard({ product, account }) {
  const platform = (product.platform || [account?.platform]).filter(Boolean).join(" / ") || "MetaTrader";
  const source = product.resultSource || accountResultSource(account);
  const sourceLabel = source === "liveCollector" ? "Live Results" : "Myfxbook Results";
  const liveAccount = account && isLiveCollectorAccount(account);
  const profileUrl = product.myfxbook_url || account?.myfxbook?.profile_url;
  const widgetUrl = product.myfxbook_widget_url || account?.myfxbook?.widget_url;

  return (
    <article className="live-result-card">
      <div className="live-result-card-head">
        <div className="live-result-logo-wrap">
          {product.logo ? <img src={product.logo} alt={`${product.name} logo`} /> : <PackageOpen size={24} />}
        </div>
        <div>
          <span className="account-platform account-platform-gold">{platform} + {sourceLabel}</span>
          <h2>{product.result_account_name || product.name}</h2>
          <p>{product.tagline}</p>
        </div>
      </div>

      <div className="live-result-meta">
        <span>System <strong>{product.name}</strong></span>
        <span>Source <strong>{sourceLabel}</strong></span>
        {account && <span>Account <strong>{account.display_name || account.name || account.login}</strong></span>}
      </div>

      {widgetUrl ? (
        <a className="live-result-widget" href={profileUrl || widgetUrl} target="_blank" rel="noreferrer">
          <img src={widgetUrl} alt={`${product.name} Myfxbook widget`} />
        </a>
      ) : (
        <div className="empty-panel">Results link coming soon.</div>
      )}

      <div className="live-result-actions">
        {profileUrl ? (
          <a className="btn-gold" href={profileUrl} target="_blank" rel="noreferrer">
            Open Myfxbook <ExternalLink size={15} />
          </a>
        ) : (
          <span className="btn-ghost-gold live-result-disabled">Myfxbook coming soon</span>
        )}
        {liveAccount && <Link className="btn-ghost-gold" to={`/live-results/a/${account.slug}`}>Open MT5 dashboard</Link>}
        <Link className="btn-ghost-gold" to={`/systems/${product.slug}`}>Product details</Link>
      </div>
    </article>
  );
}

function accountForProduct(product, accounts) {
  if (!accounts?.length) return null;
  const slug = product.slug;
  if (slug === "matrader-quickscalper") {
    return accounts.find((item) => item.slug === "mt4-35115307" || String(item.login) === "35115307") || null;
  }
  if (slug === "aurix-neural-edge-ai") {
    return (
      accounts.find((item) => item.system_slug === slug || String(item.login) === "77045247" || /aurix/i.test(item.display_name || item.name || "")) ||
      null
    );
  }
  if (slug === "matrader-ai") {
    return accounts.find((item) => item.system_slug === slug || /matrader/i.test(item.display_name || item.name || "")) || null;
  }
  return accounts.find((item) => item.system_slug === slug) || null;
}

function AccountMyfxbookPanel({ account }) {
  const myfxbook = myfxbookForAccount(account);
  if (!myfxbook) {
    return (
      <section className="myfxbook-panel myfxbook-panel-compact">
        <div className="section-heading">
          <h2>Myfxbook Verification</h2>
        </div>
        <div className="empty-panel mt-4">Results link coming soon.</div>
      </section>
    );
  }

  return (
    <section className="myfxbook-panel myfxbook-panel-compact">
      <div className="section-heading">
        <h2>Myfxbook Verification</h2>
        <a className="mini-link" href={myfxbook.profile_url} target="_blank" rel="noreferrer">Open</a>
      </div>
      <div className="myfxbook-widget">
        <div className="myfxbook-top">
          <strong>my<span>fx</span>book</strong>
          <small>{account.display_name || account.name}</small>
        </div>
        <a href={myfxbook.profile_url} target="_blank" rel="noreferrer">
          <img src={myfxbook.widget_url || "https://widget.myfxbook.com/widget/widget.png?accountOid=12049164&type=6"} alt={`${account.display_name || account.name} Myfxbook widget`} />
        </a>
      </div>
      <div className="myfxbook-meta">
        <span>MT4 + Myfxbook Results</span>
        <small>{myfxbook.label}</small>
      </div>
    </section>
  );
}

function MyfxbookOnlyDashboard({ account }) {
  const myfxbook = myfxbookForAccount(account);
  return (
    <>
      <section className="myfxbook-only-hero">
        <div>
          <span className="account-platform account-platform-gold">MT4</span>
          <h2>{account.display_name || account.name}</h2>
          <p>
            This MT4 account is intentionally not connected to the internal live collector. Results for MT4 systems are reviewed through Myfxbook.
          </p>
        </div>
        {myfxbook ? (
          <a className="btn-gold" href={myfxbook.profile_url} target="_blank" rel="noreferrer">
            Open Myfxbook <ExternalLink size={16} />
          </a>
        ) : (
          <span className="empty-panel">Results link coming soon</span>
        )}
      </section>
      <AccountMyfxbookPanel account={account} />
      <p className="risk-disclaimer">{RISK_DISCLAIMER}</p>
    </>
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
