import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { money, percent } from "@/lib/format";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/systems/${product.slug}`}
      data-testid={`product-card-${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(24,24,27,0.06)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : null}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 backdrop-blur">
          {product.strategy_type}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">{product.name}</h3>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-900" />
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500">{product.tagline}</p>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4">
          <Stat label="Monthly" value={percent(product.monthly_return)} positive={product.monthly_return > 0} />
          <Stat label="Drawdown" value={percent(product.drawdown)} negative />
          <Stat label="Platform" value={product.platform.join(" / ")} />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <p className="text-xs text-zinc-400 line-through">{money(product.compare_at_price)}</p>
            )}
            <p className="text-lg font-semibold tracking-tight text-zinc-900">{money(product.price)}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, positive, negative }) {
  const tone = positive ? "text-emerald-600" : negative ? "text-rose-600" : "text-zinc-700";
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">{label}</p>
      <p className={`mt-1 text-[13px] font-medium ${tone}`}>{value}</p>
    </div>
  );
}
