import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink, ShieldCheck, ShoppingCart } from "lucide-react";
import { money, percent } from "@/lib/format";
import { useCart } from "@/lib/cart";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const resultSource = product.resultSource || product.result_source || (product.platform?.includes("MT4") ? "myfxbook" : "liveCollector");
  const resultLabel = resultSource === "myfxbook" ? "MT4 + Myfxbook Results" : "MT5 + Live Results";
  const hasResultsLink = Boolean(product.myfxbook_url);

  const buyNow = () => {
    addItem(product);
    navigate("/cart");
  };

  return (
    <article
      data-testid={`product-card-${product.slug}`}
      className="group flex min-h-[420px] flex-col overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-accent)] hover:shadow-[0_16px_40px_rgba(24,24,27,0.10)]"
    >
      <div className="flex items-start gap-4 border-b border-[color:var(--color-border)] p-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          {product.logo ? (
            <img src={product.logo} alt={`${product.name} logo`} className="h-full w-full object-contain" loading="lazy" />
          ) : (
            <span className="text-lg font-bold text-[color:var(--color-accent)]">TS</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">{product.strategy_type}</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-[color:var(--color-text)]">{product.name}</h3>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">{product.platform?.join(" / ")} - {product.symbols?.join(", ")}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-3 text-[15px] leading-relaxed text-[color:var(--color-muted)]">{product.tagline}</p>

        <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(31,157,86,0.20)] bg-[rgba(31,157,86,0.08)] px-3 py-1 text-xs font-semibold text-[color:var(--color-success)]">
          <ShieldCheck className="h-3.5 w-3.5" />
          {resultLabel}
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-[color:var(--color-border)] rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <Stat label="Monthly" value={percent(product.monthly_return)} tone="profit" />
          <Stat label="Drawdown" value={percent(product.drawdown)} tone="loss" />
          <Stat label="Win Rate" value={`${product.win_rate}%`} />
        </div>

        <div className="mt-6 border-t border-[color:var(--color-border)] pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-dim)]">Limited offer</p>
          <div className="mt-1 flex flex-wrap items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-[color:var(--color-text)]">{money(product.price)}</span>
            <span className="pb-1 text-base font-semibold text-[color:var(--color-dim)] line-through">{money(product.compare_at_price)}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[color:var(--color-accent)]">Reduced from $250</p>
        </div>

        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <button type="button" onClick={buyNow} className="btn-gold h-11 px-4 text-sm" data-testid={`buy-${product.slug}`}>
            Buy Now <ShoppingCart className="h-4 w-4" />
          </button>
          <Link to={`/systems/${product.slug}`} className="btn-ghost-gold h-11 px-4 text-sm">
            Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {hasResultsLink ? (
          <a href={product.myfxbook_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[color:var(--color-success)] hover:text-[color:var(--color-text)]">
            View Results <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <p className="mt-3 text-center text-sm font-semibold text-[color:var(--color-muted)]">Results link coming soon</p>
        )}
      </div>
    </article>
  );
}

function Stat({ label, value, tone }) {
  const cls = tone === "profit" ? "text-[color:var(--color-success)]" : tone === "loss" ? "text-[color:var(--color-danger)]" : "text-[color:var(--color-text)]";
  return (
    <div className="px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-dim)]">{label}</p>
      <p className={`mt-1 text-sm font-bold ${cls}`}>{value}</p>
    </div>
  );
}
