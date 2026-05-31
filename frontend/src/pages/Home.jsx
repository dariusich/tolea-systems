import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  LockKeyhole,
  PieChart,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { api } from "@/lib/api";
import { money, percent, number } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import MetricCard from "@/components/MetricCard";
import FAQ from "@/components/FAQ";
import Stars from "@/components/Stars";
import PageHelmet from "@/components/PageHelmet";
import { EquityChart } from "@/components/Charts";
import { TID } from "@/lib/testIds";

const ACCENT = "#C89B5A";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Verified Performance",
    body: "Real accounts. Real results.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    body: "Professional metrics and insights.",
  },
  {
    icon: PieChart,
    title: "Risk Management",
    body: "Built for capital preservation.",
  },
  {
    icon: LockKeyhole,
    title: "Transparency",
    body: "No hype. Just results.",
  },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=80&q=80",
];

const FAQS = [
  {
    q: "How is performance verified?",
    a: "Every public system on Tolea Systems is connected to a live brokerage account. Equity, balance, drawdown and trade history are sourced from those accounts and cannot be edited manually.",
  },
  {
    q: "Do I get lifetime updates?",
    a: "Yes. All EAs and indicators include lifetime updates and access to our private support channel.",
  },
  {
    q: "Which platforms are supported?",
    a: "MetaTrader 4 and MetaTrader 5 are supported across all EAs and indicators.",
  },
  {
    q: "What is the refund policy?",
    a: "Digital systems are non-refundable once delivered. Set files and indicators carry a 14-day satisfaction window if the product cannot be installed.",
  },
];

const MOCK_EQUITY_POINTS = [
  [8, 74],
  [17, 68],
  [26, 61],
  [35, 56],
  [44, 50],
  [53, 54],
  [62, 46],
  [71, 40],
  [80, 31],
  [89, 24],
  [98, 28],
  [107, 16],
  [116, 18],
];

const MOCK_BENCHMARK_POINTS = [
  [8, 82],
  [17, 78],
  [26, 76],
  [35, 72],
  [44, 70],
  [53, 65],
  [62, 68],
  [71, 61],
  [80, 58],
  [89, 50],
  [98, 54],
  [107, 46],
  [116, 42],
];

const MOCK_MONTHS = [
  { label: "Jul", value: -4 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: -2 },
  { label: "Oct", value: 14 },
  { label: "Nov", value: -9 },
  { label: "Dec", value: 16 },
  { label: "Jan", value: 10 },
  { label: "Feb", value: -18 },
  { label: "Mar", value: 12 },
  { label: "Apr", value: 15 },
  { label: "May", value: -12 },
  { label: "Jun", value: -5 },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [summary, setSummary] = useState(null);
  const [previewAccount, setPreviewAccount] = useState(null);

  useEffect(() => {
    api.get("/products/featured").then(({ data }) => setFeatured(data.products));
    api.get("/accounts").then(({ data }) => {
      setSummary(data.summary);
      if (data.accounts?.[0]) {
        api.get(`/accounts/${data.accounts[0].slug}`).then(({ data: details }) => setPreviewAccount(details.account));
      }
    });
  }, []);

  return (
    <>
      <PageHelmet
        title="Professional Algorithmic Trading Systems"
        description="Carefully selected trading systems with transparent performance statistics and professional analytics."
      />

      <section className="relative overflow-hidden bg-hero-glow">
        <div className="bg-dotted absolute inset-0 -z-10" />
        <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,155,90,0.18),transparent_65%)] blur-3xl" />
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1500px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-20 xl:px-16">
          <div className="max-w-2xl">
            <BrandLockup />
            <h1 className="animate-fade-up mt-12 text-[clamp(3.4rem,7.5vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-slate-950" style={{ animationDelay: "60ms" }}>
              Professional
              <span className="block text-[color:var(--color-accent)]">Algorithmic</span>
              <span className="block">Trading Systems</span>
            </h1>
            <p className="animate-fade-up mt-7 max-w-xl text-lg leading-8 text-slate-500 sm:text-xl" style={{ animationDelay: "120ms" }}>
              Carefully selected trading systems with transparent performance statistics and professional analytics.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "180ms" }}>
              <Link
                to="/systems"
                data-testid={TID.heroCtaExplore}
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-lg bg-[color:var(--color-accent)] px-8 text-base font-semibold text-white shadow-[0_18px_38px_rgba(200,155,90,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-hover)]"
              >
                Explore Systems
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/live-results"
                data-testid={TID.heroCtaLive}
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white/80 px-8 text-base font-semibold text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)]"
              >
                View Live Results
                <ArrowRight className="h-4 w-4 text-[color:var(--color-accent)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_ITEMS.map((item, index) => (
                <TrustItem key={item.title} item={item} delay={index * 60 + 220} />
              ))}
            </div>

            <div className="animate-fade-up mt-12 flex flex-col gap-5 sm:flex-row sm:items-center" style={{ animationDelay: "480ms" }}>
              <div>
                <p className="text-sm font-semibold text-slate-950">Trusted by traders worldwide</p>
                <div className="mt-3 flex -space-x-2">
                  {AVATARS.map((avatar) => (
                    <img
                      key={avatar}
                      src={avatar}
                      alt=""
                      className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
              <div className="h-px w-full bg-slate-200 sm:h-12 sm:w-px" />
              <div className="flex items-center gap-4">
                <Stars value={5} size={16} />
                <div>
                  <p className="text-base font-semibold text-slate-950">4.9/5</p>
                  <p className="text-sm text-slate-500">Based on 500+ reviews</p>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-dashboard-in relative mx-auto w-full max-w-4xl lg:mr-[-7rem]">
            <DashboardPreview />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-4 py-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:px-6 lg:px-8">
          <span>MetaTrader 4</span>
          <span>MetaTrader 5</span>
          <span>Verified Accounts</span>
          <span>Risk Analytics</span>
          <span>Live Performance</span>
        </div>
      </section>

      {summary && (
        <section className="bg-[color:var(--color-surface)] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Performance overview"
              title="A calmer way to evaluate trading systems."
              body="Live account data, clean reporting, and risk-aware analytics are kept in one transparent view."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Avg monthly" value={percent(summary.avg_monthly_gain)} tone="brand" />
              <MetricCard label="Avg total return" value={percent(summary.avg_total_gain)} tone="profit" />
              <MetricCard label="Max drawdown" value={percent(summary.max_drawdown)} tone="loss" />
              <MetricCard label="Active systems" value={number(summary.active_systems)} tone="brand" />
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Featured systems"
            title="Carefully selected. Verifiably performant."
            body="A curated catalog built around clarity, risk discipline, and performance that can be inspected."
            compact
          />
          <Link to="/systems" className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent-hover)] hover:text-slate-950">
            View all systems <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {previewAccount && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.07)]">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-slate-200 bg-[color:var(--color-surface)] p-8 lg:border-b-0 lg:border-r">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-hover)]">Live results preview</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {previewAccount.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  Verified equity, drawdown, and trade history streamed from connected accounts. Every system ships with a public performance page.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <KV label="Balance" value={money(previewAccount.balance)} />
                  <KV label="Total gain" value={percent(previewAccount.total_gain)} tone="profit" />
                  <KV label="Max drawdown" value={percent(previewAccount.drawdown)} tone="loss" />
                  <KV label="Win rate" value={`${previewAccount.win_rate}%`} />
                </div>
                <Link
                  to="/live-results"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent-hover)] hover:text-slate-950"
                >
                  Open live results <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="p-4 sm:p-8">
                <EquityChart data={previewAccount.chart || []} height={320} />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-[color:var(--color-surface)] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why TOLEA Systems"
            title="Built like a product, not a pitch."
            body="The platform pairs marketplace clarity with connected account data so traders can evaluate systems without noisy marketing."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <FeatureCard icon={CheckCircle2} title="Curated catalog" body="Fewer systems, clearer standards, and product pages that explain risk before hype." />
            <FeatureCard icon={Eye} title="Transparent reporting" body="Public live results, trade history, equity curve, and account-level performance context." />
            <FeatureCard icon={SlidersHorizontal} title="Operational control" body="Local collectors, offline-friendly storage, and dashboards built for repeated review." />
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-hover)]">FAQ</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Common questions.
        </h2>
        <div className="mt-10">
          <FAQ items={FAQS} />
        </div>
      </section>
    </>
  );
}

function BrandLockup() {
  return (
    <div className="animate-fade-up flex items-center gap-5">
      <div className="grid h-20 w-20 place-items-center rounded-[1.4rem] bg-[linear-gradient(135deg,#E7C88F,#B88745)] text-3xl font-black tracking-[-0.12em] text-white shadow-[0_18px_45px_rgba(200,155,90,0.28)]">
        TS
      </div>
      <div>
        <p className="text-[2rem] font-semibold leading-none tracking-[0.42em] text-slate-950">TOLEA</p>
        <p className="mt-1 text-sm font-semibold tracking-[0.58em] text-[color:var(--color-accent-hover)]">SYSTEMS</p>
      </div>
    </div>
  );
}

function TrustItem({ item, delay }) {
  const Icon = item.icon;
  return (
    <div className="animate-stat-pop rounded-2xl border border-transparent p-1 transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white/70 hover:shadow-sm" style={{ animationDelay: `${delay}ms` }}>
      <Icon className="h-8 w-8 text-[color:var(--color-accent-hover)]" strokeWidth={1.6} />
      <h3 className="mt-4 text-sm font-semibold text-slate-950">{item.title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{item.body}</p>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -bottom-16 left-20 right-4 top-10 -z-10 rounded-[2rem] bg-[rgba(200,155,90,0.18)] blur-3xl" />
      <div className="origin-center rotate-[4deg] overflow-hidden rounded-[1.7rem] border border-white/80 bg-white shadow-[0_34px_110px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/80 transition-transform duration-500 hover:rotate-[2deg]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[linear-gradient(135deg,#E7C88F,#B88745)] text-xs font-black tracking-[-0.08em] text-white">TS</div>
            <div>
              <p className="text-sm font-semibold tracking-[0.28em] text-slate-950">TOLEA</p>
              <p className="text-[9px] font-semibold tracking-[0.38em] text-[color:var(--color-accent-hover)]">SYSTEMS</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            {["Overview", "Performance", "Trades", "Analytics", "Settings"].map((item, index) => (
              <span key={item} className={index === 0 ? "border-b-2 border-[color:var(--color-accent)] pb-2 text-[color:var(--color-accent-hover)]" : ""}>
                {item}
              </span>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-[64px_1fr] bg-slate-50/70">
          <aside className="hidden border-r border-slate-100 bg-white/80 py-8 sm:block">
            <div className="flex flex-col items-center gap-6 text-slate-400">
              {[Activity, BarChart3, SlidersHorizontal, Star, PieChart].map((Icon, index) => (
                <span key={index} className={index === 0 ? "grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--color-accent)] text-white shadow-lg shadow-[rgba(200,155,90,0.25)]" : "grid h-9 w-9 place-items-center rounded-xl"}>
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </aside>

          <div className="col-span-2 space-y-5 p-4 sm:col-span-1 sm:p-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">Equity Curve</h2>
                  <div className="mt-3 flex items-center gap-5 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[color:var(--color-accent)]" /> Equity</span>
                    <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-slate-300" /> Benchmark</span>
                  </div>
                </div>
                <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-500">
                  {["1M", "3M", "1Y", "All"].map((period) => (
                    <span key={period} className={period === "1Y" ? "rounded-lg bg-[color:var(--color-accent-light)] px-3 py-1.5 text-[color:var(--color-accent-hover)]" : "px-3 py-1.5"}>
                      {period}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative mt-4 h-64 overflow-hidden rounded-xl">
                <MockEquityChart />
                <div className="absolute right-6 top-16 rounded-2xl border border-slate-100 bg-white/95 p-4 text-sm shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur">
                  <p className="text-xs text-slate-500">May 24, 2024</p>
                  <p className="mt-3 flex items-center justify-between gap-8 text-slate-500">
                    <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-accent)]" /> Equity</span>
                    <strong className="text-slate-950">$128,450</strong>
                  </p>
                  <p className="mt-2 flex items-center justify-between gap-8 text-slate-500">
                    <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Benchmark</span>
                    <strong className="text-slate-950">$64,721</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <PreviewKpi label="Total Return" value="+128.45%" tone="profit" sub="All time" />
              <PreviewKpi label="Monthly Return" value="+8.32%" tone="profit" sub="This month" />
              <PreviewKpi label="Win Rate" value="71.3%" sub="All time" />
              <PreviewKpi label="Max Drawdown" value="-12.45%" tone="loss" sub="All time" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.75fr_0.65fr]">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-950">Monthly Performance</h3>
                <div className="mt-5 flex h-40 items-end gap-2 border-b border-slate-100 pb-2">
                  {MOCK_MONTHS.map((month) => (
                    <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
                      <span
                        className={month.value >= 0 ? "w-full rounded-t bg-[color:var(--color-success)]" : "w-full rounded-b bg-[color:var(--color-loss)]"}
                        style={{ height: `${Math.max(12, Math.abs(month.value) * 5)}px` }}
                      />
                      <span className="text-[10px] text-slate-400">{month.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                <h3 className="text-left text-base font-semibold text-slate-950">Risk Score</h3>
                <div className="mx-auto mt-6 grid h-32 w-32 place-items-center rounded-full bg-[conic-gradient(#C89B5A_0_85%,#F3E8D6_85%_100%)]">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
                    <span className="text-3xl font-semibold text-slate-950">85</span>
                    <span className="-mt-8 text-xs text-slate-500">/100</span>
                  </div>
                </div>
                <p className="mt-5 text-sm font-semibold text-[color:var(--color-success)]">Low Risk</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-950">Active Systems</h3>
                <p className="mt-5 text-4xl font-semibold text-slate-950">12</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--color-success)]">Running</p>
                <svg viewBox="0 0 140 52" className="mt-6 h-16 w-full overflow-visible">
                  <polyline
                    points="0,42 12,38 24,34 36,36 48,30 60,28 72,31 84,22 96,24 108,18 120,13 132,6"
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockEquityChart() {
  const equity = MOCK_EQUITY_POINTS.map(([x, y]) => `${x},${y}`).join(" ");
  const benchmark = MOCK_BENCHMARK_POINTS.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 124 90" className="h-full w-full">
      <defs>
        <linearGradient id="mockGoldFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 35, 50, 65, 80].map((y) => (
        <line key={y} x1="6" x2="120" y1={y} y2={y} stroke="#EEF2F7" strokeWidth="0.55" />
      ))}
      <polyline points={benchmark} fill="none" stroke="#CBD5E1" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`8,90 ${equity} 116,90`} fill="url(#mockGoldFill)" />
      <polyline points={equity} fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="116" cy="18" r="1.8" fill={ACCENT} />
      {["Jan 23", "Mar 23", "May 23", "Jul 23", "Sep 23", "Nov 23", "Jan 24", "Mar 24", "May 24"].map((label, index) => (
        <text key={label} x={8 + index * 13.4} y="87" fill="#94A3B8" fontSize="3.2">
          {label}
        </text>
      ))}
    </svg>
  );
}

function PreviewKpi({ label, value, tone, sub }) {
  const color = tone === "profit" ? "text-[color:var(--color-success)]" : tone === "loss" ? "text-[color:var(--color-loss)]" : "text-slate-950";
  return (
    <div className="animate-stat-pop rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <p className={`mt-4 text-2xl font-semibold tracking-tight ${color}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title, body, compact = false }) {
  return (
    <div className={compact ? "max-w-2xl" : "mx-auto max-w-3xl text-center"}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-hover)]">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-500">{body}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,0.07)]">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--color-accent-light)] text-[color:var(--color-accent-hover)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-500">{body}</p>
    </div>
  );
}

function KV({ label, value, tone }) {
  const color = tone === "profit" ? "text-[color:var(--color-success)]" : tone === "loss" ? "text-[color:var(--color-loss)]" : "text-slate-950";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${color}`}>{value}</p>
    </div>
  );
}
