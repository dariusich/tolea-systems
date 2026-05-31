import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { money, percent } from "@/lib/format";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/systems/${product.slug}`}
      data-testid={`product-card-${product.slug}`}
      className="group flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-[#E7E4DA] bg-white shadow-[0_18px_55px_rgba(17,24,39,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D6A84F]/60 hover:shadow-[0_28px_80px_rgba(17,24,39,0.10)]"
    >
      <div className="flex items-start gap-4 border-b border-[#F0EDE5] bg-gradient-to-br from-white to-[#F8F6EF] p-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#E7E4DA] bg-white">
          {product.logo ? (
            <img src={product.logo} alt={`${product.name} logo`} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="text-lg font-black text-[#087F5B]">TS</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-black tracking-tight text-[#111827]">{product.name}</h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[#6B7280] transition-colors group-hover:text-[#087F5B]" />
          </div>
          <p className="mt-1 text-sm font-semibold text-[#087F5B]">{product.strategy_type}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-3 text-sm leading-6 text-[#6B7280]">{product.tagline}</p>

        <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-[#087F5B]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Myfxbook connected
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-[#F0EDE5] bg-[#FBFAF7] p-3">
          <Stat label="Monthly" value={percent(product.monthly_return)} tone="profit" />
          <Stat label="Drawdown" value={percent(product.drawdown)} tone="loss" />
          <Stat label="Win Rate" value={`${product.win_rate}%`} />
        </div>

        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">MQL5 price</p>
            <p className="mt-1 text-xl font-black tracking-tight text-[#111827]">
              {Number(product.price || 0) === 0 ? "Free" : money(product.price)}
            </p>
          </div>
          <span className="inline-flex h-10 items-center rounded-lg bg-[#087F5B] px-4 text-sm font-black text-white transition-colors group-hover:bg-[#059669]">
            View product
          </span>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, tone }) {
  const cls = tone === "profit" ? "text-[#059669]" : tone === "loss" ? "text-[#EF4444]" : "text-[#111827]";
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9CA3AF]">{label}</p>
      <p className={`mt-1 text-sm font-black ${cls}`}>{value}</p>
    </div>
  );
}
