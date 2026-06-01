import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Download,
  LineChart,
  Rocket,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { money, number } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import PageHelmet from "@/components/PageHelmet";
import BrandLogo from "@/components/BrandLogo";
import { EquityChart } from "@/components/Charts";

const DISCLAIMER = "Trading involves risk. Past performance does not guarantee future results. Expert Advisors can generate drawdown, especially in volatile market conditions. Use proper risk management.";

const faqs = [
  ["How are MT4 results verified?", "MT4 products use public Myfxbook result links. They are not connected to the internal live collector."],
  ["How are MT5 results shown live?", "MT5 accounts can be connected through the lightweight VPS collector and then displayed in the Live Results dashboard."],
  ["Is the checkout live?", "The current checkout flow is demo-safe. It records a demo order only and does not charge a card until a real payment processor is connected."],
];

const steps = [
  { icon: Target, number: "01", title: "Choose a System", text: "Browse our catalog of high quality EAs." },
  { icon: Download, number: "02", title: "Download & Setup", text: "Get everything you need to get started." },
  { icon: Rocket, number: "03", title: "Go Live", text: "Run on your account with confidence." },
  { icon: TrendingUp, number: "$49", title: "From only", text: "One-time payment. No hidden fees." },
];

function accountResultSource(account) {
  return account?.resultSource || account?.result_source || (account?.platform === "MT4" ? "myfxbook" : "liveCollector");
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [previewAccount, setPreviewAccount] = useState(null);
  const [previewTrades, setPreviewTrades] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(true);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts((data.products || []).slice(0, 3)));
    api
      .get("/accounts")
      .then(({ data }) => {
        const liveAccount = (data.accounts || []).find((item) => accountResultSource(item) === "liveCollector" || item.platform === "MT5");
        if (!liveAccount?.slug) {
          setPreviewAccount(null);
          setPreviewTrades([]);
          return;
        }
        return api.get(`/accounts/${liveAccount.slug}`).then(({ data: details }) => {
          setPreviewAccount(details.account);
          setPreviewTrades(details.trades || []);
        });
      })
      .finally(() => setPreviewLoading(false));
  }, []);

  const bestDay = useMemo(() => {
    const byDay = new Map();
    for (const trade of previewTrades) {
      const key = trade.close_time?.slice(0, 10);
      if (!key) continue;
      byDay.set(key, (byDay.get(key) || 0) + Number(trade.profit || 0));
    }
    return [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [previewTrades]);

  return (
    <>
      <PageHelmet
        title="Professional EAs With Verified Results"
        description="Tolea Systems delivers premium MetaTrader Expert Advisors with Myfxbook verification for MT4 and live collector analytics for MT5."
      />

      <main className="bg-white text-[color:var(--color-text)]">
        <section className="overview-hero">
          <div className="overview-hero-inner">
            <div className="overview-hero-copy fade-up">
              <div className="overview-hero-kicker">
                <BrandLogo className="max-w-[188px] md:max-w-[214px]" />
                <p className="overview-badge">
                  <BadgeCheck className="h-4 w-4" />
                  Optimized Expert Advisors for MetaTrader 4/5
                </p>
              </div>
              <h1 className="mt-8 max-w-[680px] text-[clamp(2.7rem,4.7vw,4.55rem)] font-black leading-[1.08] tracking-[0]">
                Clean automated trading systems with <span className="gold-gradient-text">verified results.</span>
              </h1>
              <p className="mt-6 max-w-[580px] text-[16px] leading-7 text-[color:var(--color-muted)] md:text-[18px]">
                A focused catalog of gold trading systems delivered with custom set files, setup guidance, and transparent public result links before you use them.
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Link className="home-primary-cta" to="/systems">
                  View Products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link className="home-secondary-cta" to="/live-results">
                  Live Results <LineChart className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-6 flex items-center gap-3 text-sm font-medium text-[color:var(--color-muted)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-success)] shadow-[0_0_0_5px_rgba(22,163,74,0.12)]" />
                MT5 live data appears as soon as the VPS collector syncs. MT4 results are verified via Myfxbook.
              </p>
            </div>

            <ResultsPreview account={previewAccount} trades={previewTrades} bestDay={bestDay} loading={previewLoading} />
          </div>

          <div className="overview-steps fade-up">
            {steps.map((item) => (
              <StepItem key={`${item.number}-${item.title}`} {...item} />
            ))}
          </div>
        </section>

        <section className="container-prose py-20">
          <SectionHeading
            eyebrow="Products"
            title="Three focused systems"
            text="Each product is configured around practical implementation: set files, setup notes, risk profiles, and external result links."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)]">
          <div className="container-prose py-20">
            <SectionHeading
              eyebrow="Verification"
              title="Clear result sources"
              text="MT4 products show Myfxbook verification. MT5 accounts can use the live collector dashboard when a terminal is connected."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <WhyCard icon={ShieldCheck} title="MT4 Myfxbook Results" text="Public Myfxbook links are used for MT4 products instead of internal live sync." />
              <WhyCard icon={LineChart} title="MT5 Live Analytics" text="MT5 can power the internal dashboard with closed trades, equity curve, daily PnL, and stats." />
              <WhyCard icon={BadgeCheck} title="Risk Context" text="Every product keeps a visible risk warning and avoids aggressive performance promises." />
            </div>
          </div>
        </section>

        <section className="container-prose py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[0] md:text-4xl">Frequently asked</h2>
            </div>
            <div className="divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                    {question}
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[color:var(--color-border-strong)] text-[color:var(--color-muted)] transition group-open:rotate-45 group-open:border-[color:var(--color-accent)] group-open:text-[color:var(--color-accent)]">+</span>
                  </summary>
                  <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-muted)]">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container-prose pb-12">
          <p className="rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 text-sm font-medium leading-relaxed text-[color:var(--color-muted)]">
            {DISCLAIMER}
          </p>
        </section>
      </main>
    </>
  );
}

function ResultsPreview({ account, trades, bestDay, loading }) {
  const connected = Boolean(account);
  const chart = account?.chart || [];
  const totalProfit = connected ? money(account.total_profit) : "--";
  const winRate = connected ? `${Number(account.win_rate || 0).toFixed(1)}%` : "--";
  const totalTrades = connected ? number(account.trades_count || trades.length || 0) : "--";
  const bestDayValue = connected && bestDay ? money(bestDay[1]) : "--";

  return (
    <section className="hero-proof-card fade-up">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--color-dim)]">Live trading proof</p>
          <h2 className="mt-2 text-[1.35rem] font-black tracking-[0]">Results preview</h2>
        </div>
        <span className={connected ? "chip-success" : "chip-waiting"}>
          <span className="h-2 w-2 rounded-full bg-current" />
          {connected ? "MT5 Live" : loading ? "Checking" : "Waiting"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ResultPreviewCard label="Total Profit" value={totalProfit} sublabel={connected ? "Closed MT5 PnL" : "Waiting for MT5"} tone="profit" />
        <ResultPreviewCard label="Win Rate" value={winRate} sublabel={connected ? "Average" : "No live account"} />
        <ResultPreviewCard label="Total Trades" value={totalTrades} sublabel={connected ? "All time" : "No trades yet"} />
        <ResultPreviewCard label="Best Day" value={bestDayValue} sublabel={bestDay?.[0] || "No day selected"} tone="profit" />
      </div>

      <div className="mt-4 rounded-[18px] border border-[color:var(--color-border)] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">Equity Curve</p>
          <span className="rounded-[10px] border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold text-[color:var(--color-muted)]">All time</span>
        </div>
        {chart.length ? (
          <div className="mt-4">
            <EquityChart data={chart} height={190} />
          </div>
        ) : (
          <div className="mt-4 grid h-[190px] place-items-center rounded-[14px] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-center">
            <div>
              <LineChart className="mx-auto h-7 w-7 text-[color:var(--color-accent)]" />
              <p className="mt-3 text-sm font-bold text-[color:var(--color-text)]">Waiting for MT5 live data</p>
              <p className="mt-1 max-w-xs text-xs font-medium leading-5 text-[color:var(--color-muted)]">
                Start the MT5 collector on the VPS to populate this proof card.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ResultPreviewCard({ label, value, sublabel, tone }) {
  const cls = tone === "profit" ? "text-[color:var(--color-success)]" : tone === "loss" ? "text-[color:var(--color-danger)]" : "text-[color:var(--color-text)]";
  return (
    <div className="rounded-[16px] border border-[color:var(--color-border)] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:border-[color:var(--color-accent)]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--color-dim)]">{label}</p>
      <p className={`mt-2 text-[1.45rem] font-black ${cls}`}>{value}</p>
      <p className="mt-1 text-sm font-medium text-[color:var(--color-muted)]">{sublabel}</p>
    </div>
  );
}

function StepItem({ icon: Icon, number, title, text }) {
  return (
    <article className="overview-step-card">
      <span className="overview-step-icon">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-black text-[color:var(--color-accent)]">{number}</p>
        <h3 className="mt-1 text-lg font-black tracking-[0]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">{text}</p>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[0] md:text-4xl">{title}</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-muted)]">{text}</p>
    </div>
  );
}

function WhyCard({ icon: Icon, title, text }) {
  return (
    <article className="card">
      <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-[color:var(--color-text)]">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--color-muted)]">{text}</p>
    </article>
  );
}
