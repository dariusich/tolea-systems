import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { money, percent } from "@/lib/format";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/systems/${product.slug}`}
      data-testid={`product-card-${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--color-accent)] hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#fbf7ef] to-slate-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : null}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-[color:var(--color-accent)]/30 bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-[color:var(--color-accent-hover)] backdrop-blur">
          {product.strategy_type}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-950">{product.name}</h3>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-[color:var(--color-accent-hover)]" />
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">{product.tagline}</p>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          <Stat label="Monthly" value={percent(product.monthly_return)} positive={product.monthly_return > 0} />
          <Stat label="Drawdown" value={percent(product.drawdown)} negative />
          <Stat label="Platform" value={product.platform.join(" / ")} />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <p className="text-xs text-slate-400 line-through">{money(product.compare_at_price)}</p>
            )}
            <p className="text-lg font-semibold tracking-tight text-slate-950">{money(product.price)}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors group-hover:border-[color:var(--color-accent)] group-hover:bg-[color:var(--color-accent)] group-hover:text-white">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, positive, negative }) {
  const tone = positive ? "text-[color:var(--color-success)]" : negative ? "text-[color:var(--color-loss)]" : "text-slate-700";
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className={`mt-1 text-[13px] font-medium ${tone}`}>{value}</p>
    </div>
  );
}
