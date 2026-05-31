import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, LineChart, Settings2, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { money, number } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import PageHelmet from "@/components/PageHelmet";
import { EquityChart } from "@/components/Charts";

const DISCLAIMER = "Trading involves risk. Past performance does not guarantee future results.";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [previewAccount, setPreviewAccount] = useState(null);
  const [previewTrades, setPreviewTrades] = useState([]);

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data.products || []));
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
        description="Premium automated trading systems with optimized set files, Myfxbook proof, and verified account analytics."
      />

      <main className="bg-[#F8F6EF]">
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#E7E4DA] bg-white px-4 py-2 text-sm font-black text-[#087F5B] shadow-sm">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#D6A84F] text-[10px] text-white">TS</span>
              Tolea Systems
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-[#111827] sm:text-6xl lg:text-7xl">
              Optimized automated trading systems for MT4.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B7280]">
              Expert Advisors with custom set files, practical setup guidance, and verified trading results through connected accounts and Myfxbook proof.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="home-primary-cta" to="/systems">
                View Products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="home-secondary-cta" to="/live-results">
                View Live Results <LineChart className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <section className="rounded-[28px] border border-[#E7E4DA] bg-white p-5 shadow-[0_28px_90px_rgba(17,24,39,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6B7280]">Results preview</p>
                <h2 className="mt-1 text-2xl font-black text-[#111827]">Live account analytics</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-[#087F5B]">Connected</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ResultPreviewCard label="Total Profit" value={money(summary?.total_profit || previewAccount?.total_profit || 0)} tone="profit" />
              <ResultPreviewCard label="Win Rate" value={`${Number(previewAccount?.win_rate || 0).toFixed(1)}%`} />
              <ResultPreviewCard label="Total Trades" value={number(previewAccount?.trades_count || 0)} />
              <ResultPreviewCard label="Best Day" value={bestDay ? money(bestDay[1]) : money(0)} tone="profit" />
            </div>
            <div className="mt-5 rounded-2xl border border-[#F0EDE5] bg-[#FBFAF7] p-4">
              {previewAccount?.chart?.length ? (
                <EquityChart data={previewAccount.chart} height={220} />
              ) : (
                <div className="grid h-[220px] place-items-center text-center text-sm font-semibold text-[#6B7280]">
                  Live chart appears after the collector syncs account history.
                </div>
              )}
            </div>
            <Link to="/live-results" className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087F5B] text-sm font-black text-white">
              View Live Results <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </section>

        <section className="border-y border-[#E7E4DA] bg-white">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-4 sm:px-6 lg:px-8">
            <ProofItem value="3" label="Expert Advisors" />
            <ProofItem value={summary?.active_systems || "MT4"} label="Accounts Connected" />
            <ProofItem value="3" label="Myfxbook Results" />
            <ProofItem value="Custom" label="Set Files" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Products"
            title="Three focused Expert Advisors"
            text="Each product is delivered with optimized set files, recommended account settings, and setup support."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Tolea Systems"
            title="Clean setup, verified proof, practical support"
            text="We position every EA around implementation quality, risk configuration, and transparent result tracking."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <WhyCard icon={SlidersHorizontal} title="Optimized Set Files" text="Tested and adjusted set files for cleaner execution and lower drawdown focus." />
            <WhyCard icon={Settings2} title="Practical Setup Support" text="Installation help, broker/account notes, and support until the EA is running correctly." />
            <WhyCard icon={ShieldCheck} title="Risk-Focused Configuration" text="Low Risk, Balanced, and Aggressive profiles so sizing matches the account objective." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="rounded-2xl border border-[#E7E4DA] bg-white p-4 text-sm font-semibold leading-6 text-[#6B7280]">
            {DISCLAIMER} Expert Advisors can generate drawdown, especially in volatile market conditions. Use proper risk management.
          </p>
        </section>
      </main>
    </>
  );
}

function ResultPreviewCard({ label, value, tone }) {
  const cls = tone === "profit" ? "text-[#059669]" : tone === "loss" ? "text-[#EF4444]" : "text-[#111827]";
  return (
    <div className="rounded-2xl border border-[#F0EDE5] bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9CA3AF]">{label}</p>
      <p className={`mt-2 text-2xl font-black ${cls}`}>{value}</p>
    </div>
  );
}

function ProofItem({ value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#F8F6EF] px-4 py-3">
      <CheckCircle2 className="h-5 w-5 text-[#087F5B]" />
      <div>
        <p className="text-lg font-black text-[#111827]">{value}</p>
        <p className="text-xs font-bold text-[#6B7280]">{label}</p>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087F5B]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-[#6B7280]">{text}</p>
    </div>
  );
}

function WhyCard({ icon: Icon, title, text }) {
  return (
    <article className="rounded-2xl border border-[#E7E4DA] bg-white p-6 shadow-[0_18px_55px_rgba(17,24,39,0.05)]">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F7EFE3] text-[#B88745]">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-black text-[#111827]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{text}</p>
    </article>
  );
}
