import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, ExternalLink, Mail, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { api } from "@/lib/api";
import { money, percent } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";

const DISCLAIMER = "Trading involves risk. Past performance does not guarantee future results. Expert Advisors can generate drawdown, especially in volatile market conditions. Use proper risk management.";
const OPTIMIZATION_NOTE = "At Tolea Systems, we do not simply resell the EA. We test, adjust and optimize the set files for each product in order to reduce drawdown as much as possible and keep the strategy cleaner, safer and more stable. Each client receives the information needed to put the EA into practice, together with custom set files for multiple risk profiles.";

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    api.get(`/products/${slug}`).then((res) => setData(res.data));
  }, [slug]);

  if (!data) {
    return <div className="min-h-screen bg-[#F8F6EF] px-6 py-20 text-sm font-semibold text-[#6B7280]">Loading product...</div>;
  }

  const { product } = data;

  return (
    <>
      <PageHelmet title={product.name} description={product.tagline} />
      <main className="min-h-screen bg-[#F8F6EF] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link to="/systems" className="inline-flex items-center gap-2 text-sm font-bold text-[#087F5B]">
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_410px]">
            <div className="rounded-2xl border border-[#E7E4DA] bg-white p-6 shadow-[0_18px_55px_rgba(17,24,39,0.05)] sm:p-8">
              <div className="flex flex-wrap items-start gap-5">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl border border-[#E7E4DA] bg-white shadow-sm">
                  {product.logo ? (
                    <img src={product.logo} alt={`${product.name} logo`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-[#087F5B]">TS</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6B7280]">{product.strategy_type}</p>
                  <h1 className="mt-2 text-4xl font-black tracking-tight text-[#111827] sm:text-5xl">{product.name}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-[#6B7280]">{product.tagline}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="text-4xl font-black tracking-tight text-[#111827]">{money(product.price)}</span>
                    <span className="text-lg font-black text-[#9CA3AF] line-through">{money(product.compare_at_price)}</span>
                    <span className="rounded-full bg-[#F7EFE3] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#B88745]">Limited offer: $49</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-[#087F5B]">50% discount from the original price</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-4">
                <Metric label="Monthly" value={percent(product.monthly_return)} tone="profit" />
                <Metric label="Drawdown" value={percent(product.drawdown)} tone="loss" />
                <Metric label="Win Rate" value={`${product.win_rate}%`} />
                <Metric label="Profit Factor" value={Number(product.profit_factor || 0).toFixed(2)} />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a className="primary-product-cta" href={product.myfxbook_url} target="_blank" rel="noreferrer">
                  View Results <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link className="secondary-product-cta" to={`/contact?product=${encodeURIComponent(product.slug)}`}>
                  Contact / Get Access <Mail className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <MyfxbookResultCard product={product} />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_410px]">
            <div className="space-y-6">
              <InfoCard title="Overview">
                <p>{product.description}</p>
              </InfoCard>

              <InfoCard title="Main Features">
                <ul className="feature-list">
                  {product.features.map((feature) => (
                    <li key={feature}>
                      <span><Check className="h-3.5 w-3.5" /></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </InfoCard>

              <InfoCard title="What you receive">
                <ul className="feature-list">
                  {(product.receive || []).map((item) => (
                    <li key={item}>
                      <span><Check className="h-3.5 w-3.5" /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </InfoCard>

              <InfoCard title="Our optimization note">
                <p>{OPTIMIZATION_NOTE}</p>
              </InfoCard>

              <GalleryGrid product={product} />
            </div>

            <div className="space-y-6">
              <InfoCard title="Recommended Setup">
                <ul className="setup-list">
                  {(product.recommended_setup || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                  <li>Risk profile options: Low Risk, Balanced, Aggressive</li>
                </ul>
              </InfoCard>

              <InfoCard title="Specifications">
                <dl className="spec-grid">
                  <Spec label="Platform" value={product.platform?.join(" / ")} />
                  <Spec label="Symbol" value={product.symbols?.join(", ")} />
                  <Spec label="Timeframe" value={product.timeframe} />
                  <Spec label="Min balance" value={product.min_deposit ? money(product.min_deposit) : "Broker dependent"} />
                  <Spec label="Leverage" value={product.recommended_leverage} />
                  <Spec label="Limited price" value={`${money(product.price)} (50% off)`} />
                </dl>
              </InfoCard>

              <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-[0_18px_55px_rgba(17,24,39,0.05)]">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-[#EF4444]">
                    <ShieldAlert className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-black text-[#111827]">Risk Warning</h2>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#6B7280]">{product.risk_warning}</p>
                <p className="mt-4 rounded-xl bg-[#F8F6EF] p-3 text-sm font-bold text-[#111827]">{DISCLAIMER}</p>
              </section>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Metric({ label, value, tone }) {
  const cls = tone === "profit" ? "text-[#059669]" : tone === "loss" ? "text-[#EF4444]" : "text-[#111827]";
  return (
    <div className="rounded-xl border border-[#F0EDE5] bg-[#FBFAF7] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9CA3AF]">{label}</p>
      <p className={`mt-2 text-2xl font-black ${cls}`}>{value}</p>
    </div>
  );
}

function MyfxbookResultCard({ product }) {
  return (
    <section className="rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_18px_55px_rgba(17,24,39,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6B7280]">Live verification</p>
          <h2 className="mt-1 text-lg font-black text-[#111827]">Myfxbook Results</h2>
        </div>
        <ShieldCheck className="h-5 w-5 text-[#087F5B]" />
      </div>
      <a href={product.myfxbook_url} target="_blank" rel="noreferrer" className="mt-5 block overflow-hidden rounded-xl border border-[#E7E4DA] bg-[#FBFAF7] p-3">
        <img src={product.myfxbook_widget_url} alt={`${product.name} Myfxbook widget`} className="h-auto max-h-64 w-full object-contain" loading="lazy" />
      </a>
      <a className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#E7E4DA] bg-white text-sm font-black text-[#087F5B]" href={product.myfxbook_url} target="_blank" rel="noreferrer">
        Open Myfxbook <ExternalLink className="h-4 w-4" />
      </a>
    </section>
  );
}

function InfoCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-[#E7E4DA] bg-white p-6 shadow-[0_18px_55px_rgba(17,24,39,0.05)]">
      <h2 className="text-lg font-black text-[#111827]">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-[#6B7280]">{children}</div>
    </section>
  );
}

function GalleryGrid({ product }) {
  const gallery = product.gallery || [];
  const [activeIndex, setActiveIndex] = useState(null);
  if (!gallery.length) {
    return (
      <InfoCard title="Gallery">
        <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-[#D8D3C8] bg-[#FBFAF7] p-8 text-center">
          <div>
            <img src={product.logo} alt={`${product.name} logo`} className="mx-auto h-24 w-24 rounded-2xl object-cover" />
            <p className="mt-4 max-w-sm text-sm font-semibold text-[#6B7280]">
              Product screenshots are not available locally yet. The logo and Myfxbook result link remain available for verification.
            </p>
          </div>
        </div>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="Gallery">
      <div className="grid gap-3 sm:grid-cols-2">
        {gallery.map((src, index) => (
          <button key={src} type="button" onClick={() => setActiveIndex(index)} className="overflow-hidden rounded-xl border border-[#E7E4DA] bg-[#FBFAF7] text-left">
            <img src={src} alt={`${product.name} screenshot`} className="h-52 w-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
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
    </InfoCard>
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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Close gallery" onClick={onClose} className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full bg-white text-[#111827]">
          <X className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Previous image" onClick={previous} className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111827]">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <img src={images[activeIndex]} alt={`${productName} screenshot preview`} className="max-h-[78vh] w-full rounded-2xl object-contain shadow-2xl" />
        <button type="button" aria-label="Next image" onClick={next} className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111827]">
          <ChevronRight className="h-6 w-6" />
        </button>
        <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-white">
          {activeIndex + 1} / {images.length}
          <ArrowRight className="h-4 w-4 opacity-70" />
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9CA3AF]">{label}</dt>
      <dd className="mt-1 font-black text-[#111827]">{value || "-"}</dd>
    </div>
  );
}
