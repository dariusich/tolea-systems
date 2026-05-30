import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, Zap, ShieldCheck, Check, ChevronRight, Star } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { money, percent, shortDate } from "@/lib/format";
import { EquityChart, DrawdownChart } from "@/components/Charts";
import Stars from "@/components/Stars";
import FAQ from "@/components/FAQ";
import PageHelmet from "@/components/PageHelmet";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { TID } from "@/lib/testIds";

const PRODUCT_FAQS = [
  { q: "What's included with my purchase?", a: "EA executable, installation guide, recommended set files, lifetime updates, and access to the private Discord channel." },
  { q: "Do I need a VPS?", a: "We recommend running EAs on a low-latency VPS for consistent execution. Any reliable Forex VPS (under 5ms to your broker) is sufficient." },
  { q: "Can I run this on multiple accounts?", a: "Each license covers up to 2 live accounts and unlimited demo accounts unless explicitly stated otherwise." },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewEligibility, setReviewEligibility] = useState(null);

  useEffect(() => {
    setData(null);
    setReviewEligibility(null);
    api.get(`/products/${slug}`).then((res) => setData(res.data));
    // try to find a matching live account for the chart
    api.get("/accounts").then(({ data: a }) => {
      const found = a.accounts.find((acc) =>
        acc.system_name?.toLowerCase().includes((slug || "").split("-")[0])
      );
      if (found) {
        api.get(`/accounts/${found.slug}`).then(({ data: d }) => setChartData(d.account.chart || []));
      }
    });
  }, [slug]);

  // Re-fetch eligibility whenever user or slug changes (and once when reviews update)
  useEffect(() => {
    if (!slug) return;
    api
      .get(`/products/${slug}/can-review`)
      .then(({ data }) => setReviewEligibility(data))
      .catch(() => setReviewEligibility(null));
  }, [slug, user, data?.reviews?.length]);

  if (!data) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-sm text-zinc-400">Loading…</div>;
  }
  const { product, reviews } = data;

  const handleAddToCart = () => addItem(product);
  const handleBuyNow = () => {
    addItem(product);
    nav("/checkout");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (!reviewForm.title.trim() || !reviewForm.body.trim()) {
      setReviewError("Please fill in both title and body.");
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.post("/reviews", {
        product_slug: slug,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        body: reviewForm.body.trim(),
      });
      // refresh
      const { data: fresh } = await api.get(`/products/${slug}`);
      setData(fresh);
      setReviewForm({ rating: 5, title: "", body: "" });
    } catch (err) {
      setReviewError(formatApiError(err));
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <PageHelmet title={product.name} description={product.tagline} />
      {/* Breadcrumbs */}
      <div className="border-b border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-xs text-zinc-500 sm:px-6 lg:px-8">
          <Link to="/" className="hover:text-zinc-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/systems" className="hover:text-zinc-900">Marketplace</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-900">{product.name}</span>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_400px] lg:gap-14 lg:px-8 lg:py-16">
        {/* MAIN */}
        <div>
          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700">
            {product.strategy_type}
          </span>
          <h1 className="font-display mt-4 text-4xl leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-zinc-600">{product.tagline}</p>

          <div className="mt-6 flex items-center gap-4">
            <Stars value={product.rating} />
            <span className="text-sm text-zinc-500">
              {product.rating?.toFixed(1)} · {product.review_count} reviews
            </span>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-4">
            <KV label="Monthly return" value={percent(product.monthly_return)} tone="profit" />
            <KV label="Drawdown" value={percent(product.drawdown)} tone="loss" />
            <KV label="Win rate" value={`${product.win_rate}%`} />
            <KV label="Profit factor" value={product.profit_factor?.toFixed(2)} />
          </div>

          {/* Equity chart */}
          {chartData.length > 0 && (
            <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900">Equity curve · 90 days</h2>
                <Link to="/live-results" className="text-xs text-blue-600 hover:text-blue-700">Open full live results →</Link>
              </div>
              <div className="mt-4">
                <EquityChart data={chartData} height={300} />
              </div>
              <h3 className="mt-8 text-sm font-semibold tracking-tight text-zinc-900">Drawdown</h3>
              <div className="mt-2">
                <DrawdownChart data={chartData} height={180} />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">Overview</h2>
            <div className="mt-3 max-w-3xl whitespace-pre-line text-base leading-relaxed text-zinc-700">
              {product.description}
            </div>
          </div>

          {/* Features */}
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">What's included</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">Specifications</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Spec label="Strategy" value={product.strategy_type} />
              <Spec label="Symbols" value={product.symbols.join(", ")} />
              <Spec label="Timeframe" value={product.timeframe} />
              <Spec label="Platform" value={product.platform.join(" / ")} />
              <Spec label="Min deposit" value={product.min_deposit ? money(product.min_deposit) : "—"} />
              <Spec label="Recommended leverage" value={product.recommended_leverage} />
              <Spec label="Risk level" value={product.risk_level} />
            </dl>
          </div>

          {/* Reviews */}
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">Reviews</h2>

            {/* Write-a-review gating */}
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5" data-testid="review-section">
              {!user && (
                <p className="text-sm text-zinc-600">
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Sign in</Link> to leave a review for a product you've purchased.
                </p>
              )}

              {user && reviewEligibility?.has_reviewed && (
                <p className="text-sm text-emerald-700" data-testid="review-already">
                  Thanks — you've already reviewed this product.
                </p>
              )}

              {user && !reviewEligibility?.has_reviewed && reviewEligibility?.can_review === false && (
                <div className="text-sm text-zinc-600" data-testid="review-locked">
                  <p className="font-medium text-zinc-900">Verified purchase required</p>
                  <p className="mt-1">Only customers who have purchased this product can leave a review.{" "}
                    <Link to={`/systems/${slug}`} className="font-medium text-blue-600 hover:text-blue-700"
                      onClick={(e) => { e.preventDefault(); document.querySelector('[data-testid="product-buy-now"]')?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                    >Buy this system</Link> to unlock reviewing.
                  </p>
                </div>
              )}

              {user && reviewEligibility?.can_review && (
                <form onSubmit={submitReview} className="space-y-3" data-testid="review-form">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-900">Share your experience</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <Check className="h-3 w-3" /> Verified purchaser
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                        aria-label={`${n} stars`}
                        data-testid={`review-star-${n}`}
                        className="grid h-7 w-7 place-items-center rounded-full hover:bg-zinc-100"
                      >
                        <Star
                          className={n <= reviewForm.rating ? "h-4 w-4 text-amber-500" : "h-4 w-4 text-zinc-300"}
                          fill={n <= reviewForm.rating ? "#f59e0b" : "none"}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-zinc-500">{reviewForm.rating} / 5</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Title (e.g. Excellent risk discipline)"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    data-testid="review-title"
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <textarea
                    placeholder="What's your experience with this system?"
                    rows={3}
                    value={reviewForm.body}
                    onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                    data-testid="review-body"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {reviewError && <p className="text-xs text-rose-600" data-testid="review-error">{reviewError}</p>}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      data-testid="review-submit"
                      className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                    >
                      {reviewSubmitting ? "Posting…" : "Post review"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">No reviews yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <article key={r.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-900">{r.author}</p>
                        {r.verified_purchase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            <Check className="h-2.5 w-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{shortDate(r.created_at)}</p>
                    <h3 className="mt-3 text-[15px] font-semibold text-zinc-900">{r.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600">{r.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">FAQ</h2>
            <div className="mt-4">
              <FAQ items={PRODUCT_FAQS} />
            </div>
          </div>
        </div>

        {/* PURCHASE CARD */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="aspect-[16/10] bg-gradient-to-br from-zinc-50 to-zinc-100">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-end gap-3">
                <p className="text-3xl font-semibold tracking-tight text-zinc-900">{money(product.price)}</p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <p className="pb-1 text-sm text-zinc-400 line-through">{money(product.compare_at_price)}</p>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500">One-time purchase · Lifetime updates</p>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  data-testid={TID.productBuyNow}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800"
                >
                  <Zap className="h-4 w-4" /> Buy now
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  data-testid={TID.productAddCart}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  <ShoppingCart className="h-4 w-4" /> Add to cart
                </button>
              </div>

              <div className="mt-6 space-y-3 border-t border-zinc-100 pt-4 text-sm text-zinc-600">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified live performance</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Lifetime updates</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Private support channel</div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

function KV({ label, value, tone }) {
  const cls = tone === "profit" ? "text-emerald-600" : tone === "loss" ? "text-rose-600" : "text-zinc-900";
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${cls}`}>{value}</p>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-900">{value}</span>
    </div>
  );
}
