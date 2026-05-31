import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, LineChart, Settings2, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { money, number } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import PageHelmet from "@/components/PageHelmet";
import BrandLogo from "@/components/BrandLogo";
import { EquityChart } from "@/components/Charts";

const DISCLAIMER = "Trading involves risk. Past performance does not guarantee future results. Expert Advisors can generate drawdown, especially in volatile market conditions. Use proper risk management.";

const faqs = [
  ["Are the systems ready to use?", "Each EA is delivered with Tolea Systems set files and setup guidance. You still need to install it correctly, use a suitable broker, and choose a risk profile that matches your account."],
  ["Is the checkout live?", "The current checkout flow is demo-safe. It records a demo order only and does not charge a card until a real payment processor is connected."],
  ["Why do you show Myfxbook?", "Screenshots alone are not enough. Myfxbook links help buyers review public result pages and compare them with the live-results dashboard."],
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [previewAccount, setPreviewAccount] = useState(null);
  const [previewTrades, setPreviewTrades] = useState([]);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts((data.products || []).slice(0, 3)));
    api.get("/accounts").then(({ data }) => {
      setSummary(data.summary);
      if (data.accounts?.[0]) {
        api.get(`/accounts/${data.accounts[0].slug}`).then(({ data: details }) => {
          setPreviewAccount(details.account);
          setPreviewTrades(details.trades || []);
        });
      }
    });
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
        title="Optimized MT4 Expert Advisors"
        description="Tolea Systems delivers optimized MT4 Expert Advisors with set files, setup guidance, and transparent live-result tracking."
      />

      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="border-b border-[color:var(--color-border)] bg-grid-gold">
          <div className="container-prose grid gap-12 py-20 md:grid-cols-[1fr_1.05fr] md:items-center md:py-24">
            <div className="fade-up">
              <BrandLogo className="mb-8 max-w-[330px]" />
              <p className="eyebrow">Optimized Expert Advisors for MetaTrader 4</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Clean automated trading systems with verified results.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--color-muted)]">
                A focused catalog of gold trading systems delivered with custom set files, setup guidance, and public result links so you can evaluate the strategy before using it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn-gold" to="/systems">
                  View Products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link className="btn-ghost-gold" to="/live-results">
                  Live Results <LineChart className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-7 flex items-center gap-2 text-sm text-[color:var(--color-dim)]">
                <span className="h-2 w-2 rounded-full bg-[color:var(--color-success)]" />
                Real dashboard data appears as soon as the VPS collector syncs accounts.
              </p>
            </div>

            <ResultsPreview account={previewAccount} summary={summary} bestDay={bestDay} />
          </div>
        </section>

        <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
          <div className="container-prose grid grid-cols-2 divide-x divide-y divide-[color:var(--color-border)] md:grid-cols-4 md:divide-y-0">
            <ProofItem value="3" label="Curated EAs" />
            <ProofItem value={summary?.active_systems || "MT4"} label="Connected accounts" />
            <ProofItem value="3" label="Myfxbook links" />
            <ProofItem value="$49" label="Limited offer" />
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

        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
          <div className="container-prose py-20">
            <SectionHeading
              eyebrow="Process"
              title="Built around setup quality"
              text="A trading robot is only useful when the environment, risk settings, and monitoring workflow are clear."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <WhyCard icon={SlidersHorizontal} title="Optimized Set Files" text="Prepared configuration files for the intended account type and risk profile." />
              <WhyCard icon={Settings2} title="Practical Setup Support" text="Clear installation guidance, broker notes, VPS recommendations, and implementation support." />
              <WhyCard icon={ShieldCheck} title="Risk Context" text="No aggressive promises. Every product page shows risk warnings and result links." />
            </div>
          </div>
        </section>

        <section className="container-prose py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Frequently asked</h2>
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

function ResultsPreview({ account, summary, bestDay }) {
  return (
    <section className="card-elevated fade-up">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Live trading proof</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Results preview</h2>
        </div>
        <span className="chip-success">Connected</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ResultPreviewCard label="Total Profit" value={money(summary?.total_profit || account?.total_profit || 0)} tone="profit" />
        <ResultPreviewCard label="Win Rate" value={`${Number(account?.win_rate || 0).toFixed(1)}%`} />
        <ResultPreviewCard label="Total Trades" value={number(account?.trades_count || 0)} />
        <ResultPreviewCard label="Best Day" value={bestDay ? money(bestDay[1]) : money(0)} tone="profit" />
      </div>
      <div className="mt-5 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4">
        {account?.chart?.length ? (
          <EquityChart data={account.chart} height={220} />
        ) : (
          <div className="grid h-[220px] place-items-center text-center text-sm font-medium text-[color:var(--color-muted)]">
            Live chart appears after the collector syncs account history.
          </div>
        )}
      </div>
    </section>
  );
}

function ResultPreviewCard({ label, value, tone }) {
  const cls = tone === "profit" ? "text-[color:var(--color-success)]" : tone === "loss" ? "text-[color:var(--color-danger)]" : "text-[color:var(--color-text)]";
  return (
    <div className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-dim)]">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${cls}`}>{value}</p>
    </div>
  );
}

function ProofItem({ value, label }) {
  return (
    <div className="px-4 py-7 text-center">
      <div className="mx-auto flex w-fit items-center gap-2 text-3xl font-bold tracking-tight text-[color:var(--color-accent)]">
        <CheckCircle2 className="h-5 w-5" />
        {value}
      </div>
      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-dim)]">{label}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
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
