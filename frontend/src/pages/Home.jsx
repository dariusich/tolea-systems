import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, BarChart3, Sparkles, CheckCircle2, Quote } from "lucide-react";
import { api } from "@/lib/api";
import { money, percent, number } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import MetricCard from "@/components/MetricCard";
import FAQ from "@/components/FAQ";
import Stars from "@/components/Stars";
import PageHelmet from "@/components/PageHelmet";
import { EquityChart } from "@/components/Charts";
import { TID } from "@/lib/testIds";

const TESTIMONIALS = [
  {
    name: "Marcus T.",
    role: "Portfolio manager · London",
    quote:
      "What sold me was the discipline. Risk caps respected, drawdown shaped exactly as advertised, and clean reporting end-to-end.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc4MDEyNDE4Nnww&ixlib=rb-4.1.0&q=85",
  },
  {
    name: "Elena V.",
    role: "Quant developer · Lisbon",
    quote:
      "Feels like software built by engineers, not marketers. Documentation is precise and the live results page is genuinely transparent.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc4MDEyNDE4Nnww&ixlib=rb-4.1.0&q=85",
  },
  {
    name: "Priya S.",
    role: "Funded trader · Singapore",
    quote:
      "Switched from two other vendors. Smoother equity curves, real customer support, and updates land regularly without breaking anything.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc4MDEyNDE4Nnww&ixlib=rb-4.1.0&q=85",
  },
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
    a: "MetaTrader 4 and MetaTrader 5 are supported across all EAs and indicators. Select systems also offer cTrader and Tradovate adapters.",
  },
  {
    q: "What is the refund policy?",
    a: "Digital systems are non-refundable once delivered. Set files and indicators carry a 14-day satisfaction window if the product cannot be installed.",
  },
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
        api.get(`/accounts/${data.accounts[0].slug}`).then(({ data: d }) => setPreviewAccount(d.account));
      }
    });
  }, []);

  return (
    <>
      <PageHelmet
        title="Professional Algorithmic Trading Systems"
        description="Carefully selected algorithmic trading systems with transparent performance and professional analytics."
      />
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-glow">
        <div className="bg-dotted absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
              <Sparkles className="h-3 w-3 text-blue-600" />
              Verified performance · 2026 systems live
            </p>
            <h1 className="animate-fade-up font-display mt-6 text-5xl leading-[1.05] text-zinc-900 sm:text-6xl lg:text-7xl" style={{ animationDelay: "60ms" }}>
              Professional <em className="font-display italic text-blue-600">algorithmic</em>
              <br />
              trading systems
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600" style={{ animationDelay: "120ms" }}>
              A curated marketplace of trading systems with transparent performance, verified results, and modern analytics. Built for traders who care about engineering, not marketing.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "180ms" }}>
              <Link
                to="/systems"
                data-testid={TID.heroCtaExplore}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-zinc-800"
              >
                Explore systems
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/live-results"
                data-testid={TID.heroCtaLive}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                View live results
              </Link>
            </div>
          </div>

          {/* Performance overview cards */}
          {summary && (
            <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Avg monthly" value={percent(summary.avg_monthly_gain)} tone="profit" />
              <MetricCard label="Avg total return" value={percent(summary.avg_total_gain)} tone="profit" />
              <MetricCard label="Max drawdown" value={percent(summary.max_drawdown)} tone="loss" />
              <MetricCard label="Active systems" value={number(summary.active_systems)} tone="brand" />
            </div>
          )}
        </div>
      </section>

      {/* Trust line */}
      <section className="border-y border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-4 py-8 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400 sm:px-6 lg:px-8">
          <span>MetaTrader 4</span>
          <span className="hidden sm:inline">·</span>
          <span>MetaTrader 5</span>
          <span className="hidden sm:inline">·</span>
          <span>cTrader</span>
          <span className="hidden sm:inline">·</span>
          <span>IC Markets</span>
          <span className="hidden sm:inline">·</span>
          <span>Pepperstone</span>
          <span className="hidden sm:inline">·</span>
          <span>FTMO</span>
        </div>
      </section>

      {/* FEATURED SYSTEMS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Featured systems</p>
            <h2 className="font-display mt-2 text-4xl leading-tight text-zinc-900 sm:text-5xl">
              Carefully selected. <em className="italic text-blue-600">Verifiably performant.</em>
            </h2>
          </div>
          <Link to="/systems" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900">
            View all systems <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* LIVE RESULTS PREVIEW */}
      {previewAccount && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
            <div className="grid gap-0 lg:grid-cols-[1fr_1.2fr]">
              <div className="border-r-0 border-b border-zinc-200 p-8 lg:border-b-0 lg:border-r">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Live results preview</p>
                <h3 className="font-display mt-2 text-3xl leading-tight text-zinc-900">
                  {previewAccount.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  Verified equity, drawdown, and trade history streamed from connected accounts. Every system you see ships with a public, audit-trail performance page.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <KV label="Balance" value={money(previewAccount.balance)} />
                  <KV label="Total gain" value={percent(previewAccount.total_gain)} tone="profit" />
                  <KV label="Max drawdown" value={percent(previewAccount.drawdown)} tone="loss" />
                  <KV label="Win rate" value={`${previewAccount.win_rate}%`} />
                </div>
                <Link
                  to="/live-results"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
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

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Why Tolea Systems</p>
            <h2 className="font-display mt-2 text-4xl leading-tight text-zinc-900 sm:text-5xl">
              Trust, built on <em className="italic text-blue-600">transparency.</em>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600">
              We list fewer systems than anyone else in the category. Every product on the shelf has to earn its spot.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Why icon={ShieldCheck} title="Verified performance" body="Every published system reports from a real account with public history." />
            <Why icon={BarChart3} title="Professional analytics" body="Equity, drawdown, trade-level data and PnL calendar — no marketing screenshots." />
            <Why icon={CheckCircle2} title="Quality over quantity" body="A small, curated shelf. Each system is reviewed and rerun before listing." />
            <Why icon={Sparkles} title="Risk-first engineering" body="Hard daily caps, news-window protection and weekend exposure controls by default." />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-zinc-50/70 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">What traders say</p>
            <h2 className="font-display mt-2 text-4xl leading-tight text-zinc-900 sm:text-5xl">
              Built for serious traders.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <article key={t.name} className="rounded-2xl border border-zinc-200 bg-white p-6">
                <Quote className="h-5 w-5 text-blue-600" />
                <p className="mt-4 text-[15px] leading-relaxed text-zinc-700">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                  <div className="ml-auto">
                    <Stars value={5} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">FAQ</p>
        <h2 className="font-display mt-2 text-4xl leading-tight text-zinc-900 sm:text-5xl">
          Common questions.
        </h2>
        <div className="mt-10">
          <FAQ items={FAQS} />
        </div>
      </section>
    </>
  );
}

function Why({ icon: Icon, title, body }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <Icon className="h-5 w-5 text-blue-600" />
      <h3 className="mt-4 text-base font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{body}</p>
    </div>
  );
}

function KV({ label, value, tone }) {
  const cls = tone === "profit" ? "text-emerald-600" : tone === "loss" ? "text-rose-600" : "text-zinc-900";
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-base font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
