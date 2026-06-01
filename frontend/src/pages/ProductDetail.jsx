import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, ExternalLink, ShieldAlert, ShieldCheck, ShoppingCart, X } from "lucide-react";
import { api } from "@/lib/api";
import { money, percent } from "@/lib/format";
import { useCart } from "@/lib/cart";
import PageHelmet from "@/components/PageHelmet";
import ProductCard from "@/components/ProductCard";

const DISCLAIMER = "Trading involves risk. Past performance does not guarantee future results. Expert Advisors can generate drawdown, especially in volatile market conditions. Use proper risk management.";
const OPTIMIZATION_NOTE = "At Tolea Systems, we do not simply resell the EA. We test, adjust and optimize the set files for each product in order to reduce drawdown as much as possible and keep the strategy cleaner, safer and more stable. Each client receives the information needed to put the EA into practice, together with custom set files for multiple risk profiles.";

function productResultSource(product) {
  return product?.resultSource || product?.result_source || (product?.platform?.includes("MT4") ? "myfxbook" : "liveCollector");
}

function productResultLabel(product) {
  return productResultSource(product) === "myfxbook" ? "MT4 + Myfxbook Results" : "MT5 + Live Results";
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setData(null);
    setExpanded(false);
    api.get(`/products/${slug}`).then((res) => setData(res.data));
    api.get("/products").then(({ data }) => setProducts(data.products || []));
  }, [slug]);

  const product = data?.product;
  const recommended = useMemo(() => products.filter((item) => item.slug !== slug).slice(0, 2), [products, slug]);

  if (!product) {
    return <div className="min-h-screen bg-[color:var(--color-bg)] px-5 py-20 text-sm font-medium text-[color:var(--color-muted)]">Loading product...</div>;
  }

  const buyNow = () => {
    addItem(product);
    navigate("/checkout");
  };

  return (
    <>
      <PageHelmet title={product.name} description={product.tagline} />
      <main className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <div className="container-prose py-8">
          <Link to="/systems" className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent)] hover:text-[color:var(--color-text)]">
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>

          <section className="mt-8 grid gap-8 lg:grid-cols-[282px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <ProductPurchasePanel product={product} onBuy={buyNow} />
            </aside>

            <div className="min-w-0">
              <section className="border-b border-[color:var(--color-border)] pb-8">
                <p className="eyebrow">{product.strategy_type}</p>
                <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{product.name}</h1>
                    <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-[color:var(--color-muted)]">{product.tagline}</p>
                  </div>
                  <div className="chip-success self-start">
                    <ShieldCheck className="h-4 w-4" />
                    {productResultLabel(product)}
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-4">
                  <Metric label="Monthly" value={percent(product.monthly_return)} tone="profit" />
                  <Metric label="Drawdown" value={percent(product.drawdown)} tone="loss" />
                  <Metric label="Win Rate" value={`${product.win_rate}%`} />
                  <Metric label="Profit Factor" value={Number(product.profit_factor || 0).toFixed(2)} />
                </div>
              </section>

              <div className="mt-8 space-y-8">
                <ContentSection title="Overview">
                  <CollapsibleText text={product.description} expanded={expanded} setExpanded={setExpanded} />
                </ContentSection>

                <ContentSection title="What it does">
                  <p>{product.what_it_does}</p>
                </ContentSection>

                <ContentSection title="Core features">
                  <FeatureList items={product.features} />
                </ContentSection>

                <ContentSection title="Technical requirements">
                  <FeatureList items={product.technical_requirements || []} />
                </ContentSection>

                <ContentSection title="Recommended setup">
                  <ul className="prose-list">
                    {(product.recommended_setup || []).map((item) => <li key={item}>{item}</li>)}
                    <li>Risk profile options: Low Risk, Balanced, Aggressive</li>
                  </ul>
                </ContentSection>

                <ContentSection title="What you receive">
                  <FeatureList items={product.receive || []} />
                </ContentSection>

                <ContentSection title="Optimization note">
                  <p>{OPTIMIZATION_NOTE}</p>
                </ContentSection>

                <MyfxbookResultCard product={product} />

                <GalleryGrid product={product} />

                <section className="rounded-[14px] border border-[rgba(214,59,44,0.25)] bg-white p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[rgba(214,59,44,0.10)] text-[color:var(--color-danger)]">
                      <ShieldAlert className="h-5 w-5" />
                    </span>
                    <h2 className="text-xl font-bold">Risk warning</h2>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-muted)]">{product.risk_warning}</p>
                  <p className="mt-4 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3 text-sm font-semibold leading-relaxed">{DISCLAIMER}</p>
                </section>

                {recommended.length > 0 && (
                  <section className="border-t border-[color:var(--color-border)] pt-8">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="eyebrow">Recommended products</p>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight">Other Tolea systems</h2>
                      </div>
                      <Link to="/systems" className="hidden text-sm font-semibold text-[color:var(--color-accent)] hover:text-[color:var(--color-text)] sm:inline-flex">
                        View all <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      {recommended.map((item) => <ProductCard key={item.slug} product={item} />)}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function ProductPurchasePanel({ product, onBuy }) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-white">
      <div className="grid place-items-center border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6">
        <img src={product.logo || product.image} alt={`${product.name} logo`} className="h-40 w-40 rounded-[14px] object-contain" />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-dim)]">Limited offer</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-4xl font-bold tracking-tight">{money(product.price)}</span>
          <span className="pb-1 text-lg font-semibold text-[color:var(--color-dim)] line-through">{money(product.compare_at_price)}</span>
        </div>
        <p className="mt-1 text-sm font-semibold text-[color:var(--color-accent)]">Reduced from $250</p>
        <button type="button" onClick={onBuy} className="btn-gold mt-5 w-full" data-testid={`product-buy-${product.slug}`}>
          Buy Now <ShoppingCart className="h-4 w-4" />
        </button>
        {product.myfxbook_url ? (
          <a href={product.myfxbook_url} target="_blank" rel="noreferrer" className="btn-ghost-gold mt-3 w-full">
            View Results <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : (
          <p className="mt-3 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 text-center text-sm font-semibold text-[color:var(--color-muted)]">
            Results link coming soon
          </p>
        )}
        <dl className="mt-5 divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)] text-sm">
          <Spec label="Platform" value={product.platform?.join(" / ")} />
          <Spec label="Results" value={productResultLabel(product)} />
          <Spec label="Symbol" value={product.symbols?.join(", ")} />
          <Spec label="Timeframe" value={product.timeframe} />
          <Spec label="Min balance" value={product.min_deposit ? money(product.min_deposit) : "Broker dependent"} />
          <Spec label="Leverage" value={product.recommended_leverage} />
        </dl>
      </div>
    </section>
  );
}

function Metric({ label, value, tone }) {
  const cls = tone === "profit" ? "text-[color:var(--color-success)]" : tone === "loss" ? "text-[color:var(--color-danger)]" : "text-[color:var(--color-text)]";
  return (
    <div className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-dim)]">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${cls}`}>{value}</p>
    </div>
  );
}

function ContentSection({ title, children }) {
  return (
    <section className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-6">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 text-[15px] leading-[1.7] text-[color:var(--color-muted)]">{children}</div>
    </section>
  );
}

function CollapsibleText({ text, expanded, setExpanded }) {
  const shouldCollapse = text.length > 260;
  const visible = !expanded && shouldCollapse ? `${text.slice(0, 260).trim()}...` : text;
  return (
    <div>
      <p>{visible}</p>
      {shouldCollapse && (
        <button type="button" onClick={() => setExpanded(!expanded)} className="mt-4 text-sm font-semibold text-[color:var(--color-accent)] hover:text-[color:var(--color-text)]">
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function FeatureList({ items }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]">
            <Check className="h-3 w-3" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function MyfxbookResultCard({ product }) {
  if (!product.myfxbook_url) {
    return (
      <section className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-6">
        <p className="eyebrow">Results</p>
        <h2 className="mt-2 text-xl font-bold tracking-tight">Results link coming soon</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-muted)]">
          This product does not have a public Myfxbook link connected yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Results source</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight">{productResultLabel(product)}</h2>
        </div>
        <ShieldCheck className="h-5 w-5 text-[color:var(--color-success)]" />
      </div>
      <a href={product.myfxbook_url} target="_blank" rel="noreferrer" className="mt-5 block overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3">
        <img src={product.myfxbook_widget_url} alt={`${product.name} Myfxbook widget`} className="h-auto max-h-72 w-full object-contain" loading="lazy" />
      </a>
      <a className="btn-ghost-gold mt-4 w-full" href={product.myfxbook_url} target="_blank" rel="noreferrer">
        Open Myfxbook <ExternalLink className="h-4 w-4" />
      </a>
    </section>
  );
}

function GalleryGrid({ product }) {
  const gallery = product.gallery || [];
  const [activeIndex, setActiveIndex] = useState(null);

  if (!gallery.length) {
    return (
      <ContentSection title="Gallery">
        <div className="grid min-h-56 place-items-center rounded-[14px] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-8 text-center">
          <div>
            <img src={product.logo} alt={`${product.name} logo`} className="mx-auto h-24 w-24 rounded-[14px] object-cover" />
            <p className="mt-4 max-w-sm text-sm font-medium text-[color:var(--color-muted)]">
              Product screenshots are not available locally yet. The Myfxbook result link remains available for verification.
            </p>
          </div>
        </div>
      </ContentSection>
    );
  }

  return (
    <ContentSection title="Gallery">
      <div className="grid gap-3 sm:grid-cols-2">
        {gallery.map((src, index) => (
          <button key={src} type="button" onClick={() => setActiveIndex(index)} className="overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-left transition hover:border-[color:var(--color-accent)]">
            <img src={src} alt={`${product.name} screenshot`} className="h-48 w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      {activeIndex != null && (
        <LightboxModal
          images={gallery}
          productName={product.name}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </ContentSection>
  );
}

function LightboxModal({ images, productName, activeIndex, setActiveIndex, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose, setActiveIndex]);

  const previous = () => setActiveIndex((index) => (index - 1 + images.length) % images.length);
  const next = () => setActiveIndex((index) => (index + 1) % images.length);
  const current = images[activeIndex];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Close gallery" onClick={onClose} className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full bg-white text-[color:var(--color-text)]">
          <X className="h-5 w-5" />
        </button>
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={previous} className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[color:var(--color-text)]">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" aria-label="Next image" onClick={next} className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[color:var(--color-text)]">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        <img src={current} alt={`${productName} screenshot preview`} className="max-h-[78vh] w-full rounded-[14px] object-contain shadow-2xl" />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-white">
          <span>{activeIndex + 1} / {images.length}</span>
          <a href={current} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-2 text-[color:var(--color-text)]">
            Open original <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-[13px] text-[color:var(--color-muted)]">{label}</dt>
      <dd className="text-right text-[13px] font-semibold text-[color:var(--color-text)]">{value || "-"}</dd>
    </div>
  );
}
