import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, CreditCard, Tag, ArrowRight } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";
import { TID } from "@/lib/testIds";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    country: "United States",
    address: "",
    city: "",
    zip: "",
    payment_method: "stripe_demo",
  });
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);

  const discount = coupon ? Math.round(subtotal * (coupon.percent_off / 100) * 100) / 100 : 0;
  const total = Math.round((subtotal - discount) * 100) / 100;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const applyCoupon = async () => {
    setError("");
    if (!couponInput.trim()) return;
    if (couponInput.trim().toUpperCase() === "LAUNCH10") {
      setCoupon({ code: "LAUNCH10", percent_off: 10 });
    } else {
      setCoupon(null);
      setError("Coupon code not recognized.");
    }
  };

  const placeOrder = async () => {
    if (items.length === 0) return;
    if (!form.name || !form.email) {
      setError("Please provide your name and email.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/checkout/mock", {
        items: items.map((it) => ({ product_slug: it.slug, quantity: it.quantity })),
        customer: form,
        payment_method: form.payment_method,
        coupon_code: coupon?.code || null,
      });
      clear();
      nav(`/order/${data.order.id}`, { state: { order: data.order } });
    } catch (event) {
      setError(formatApiError(event));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <PageHelmet title="Checkout" />
        <main className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
          <section className="container-prose py-20">
            <p className="eyebrow">Checkout</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Nothing to check out</h1>
            <p className="mt-3 text-sm text-[color:var(--color-muted)]">Your cart is empty. Add a product first.</p>
            <Link to="/systems" className="btn-gold mt-6">
              View products <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHelmet title="Checkout" />
      <main className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="container-prose py-14">
          <p className="eyebrow">Secure checkout</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--color-muted)]">
            Demo-safe checkout only. No real payment processor is connected and no real charge is made.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_360px]">
            <div className="space-y-8">
              <Section title="Contact">
                <Field label="Full name">
                  <input className={inputCls} value={form.name} onChange={(event) => update("name", event.target.value)} data-testid="checkout-name" required />
                </Field>
                <Field label="Email">
                  <input type="email" className={inputCls} value={form.email} onChange={(event) => update("email", event.target.value)} data-testid="checkout-email" required />
                </Field>
              </Section>

              <Section title="Billing address">
                <Field label="Country">
                  <input className={inputCls} value={form.country} onChange={(event) => update("country", event.target.value)} data-testid="checkout-country" />
                </Field>
                <Field label="Address">
                  <input className={inputCls} value={form.address} onChange={(event) => update("address", event.target.value)} data-testid="checkout-address" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="City">
                    <input className={inputCls} value={form.city} onChange={(event) => update("city", event.target.value)} data-testid="checkout-city" />
                  </Field>
                  <Field label="Postal code">
                    <input className={inputCls} value={form.zip} onChange={(event) => update("zip", event.target.value)} data-testid="checkout-zip" />
                  </Field>
                </div>
              </Section>

              <Section title="Payment method">
                <div className="grid gap-2">
                  <PaymentOption active={form.payment_method === "stripe_demo"} onClick={() => update("payment_method", "stripe_demo")} label="Card checkout (demo)" testId="payment-stripe" />
                  <PaymentOption active={form.payment_method === "paypal_demo"} onClick={() => update("payment_method", "paypal_demo")} label="PayPal (demo)" testId="payment-paypal" />
                </div>
                <div className="mt-4 rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4 text-xs leading-relaxed text-[color:var(--color-muted)]">
                  This checkout is currently a demo order flow. It does not collect card details, charge money, create a real license, or send emails.
                </div>
              </Section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-6">
                <p className="eyebrow">Order summary</p>
                <ul className="mt-5 space-y-3 border-b border-[color:var(--color-border)] pb-4">
                  {items.map((it) => (
                    <li key={it.slug} className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[color:var(--color-bg)] text-xs font-semibold text-[color:var(--color-muted)]">
                        {it.quantity}
                      </span>
                      <span className="flex-1 truncate text-sm font-medium">{it.name}</span>
                      <span className="text-sm font-semibold">{money(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-dim)]">Coupon</p>
                  <div className="mt-2 flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-dim)]" />
                      <input placeholder="LAUNCH10" value={couponInput} onChange={(event) => setCouponInput(event.target.value)} data-testid={TID.checkoutCoupon} className={`${inputCls} pl-9`} />
                    </div>
                    <button type="button" onClick={applyCoupon} data-testid={TID.checkoutApplyCoupon} className="rounded-[10px] border border-[color:var(--color-border)] bg-white px-3 text-sm font-semibold hover:bg-[color:var(--color-bg)]">
                      Apply
                    </button>
                  </div>
                  {coupon && <p className="mt-2 text-xs text-[color:var(--color-success)]">{coupon.code} applied - {coupon.percent_off}% off.</p>}
                </div>

                <div className="mt-5 space-y-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
                  <Line label="Subtotal" value={money(subtotal)} />
                  {discount > 0 && <Line label="Discount" value={`- ${money(discount)}`} tone="profit" />}
                  <Line label="Total" value={money(total)} bold />
                </div>

                {error && <p className="mt-3 text-xs text-[color:var(--color-danger)]">{error}</p>}

                <button type="button" onClick={placeOrder} disabled={submitting} data-testid={TID.checkoutPlaceOrder} className="btn-gold mt-6 w-full disabled:opacity-60">
                  <Lock className="h-4 w-4" />
                  {submitting ? "Processing..." : `Create demo order for ${money(total)}`}
                </button>
                <p className="mt-3 text-center text-xs text-[color:var(--color-dim)]">Demo mode - no real payment, account, email, or license is created.</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

const inputCls =
  "h-10 w-full rounded-[10px] border border-[color:var(--color-border)] bg-white px-3 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-dim)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(184,127,54,0.18)]";

function Section({ title, children }) {
  return (
    <section className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[color:var(--color-muted)]">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function PaymentOption({ active, onClick, label, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`flex items-center justify-between rounded-[10px] border px-4 py-3 text-left text-sm transition-colors ${
        active ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-white" : "border-[color:var(--color-border)] bg-white text-[color:var(--color-muted)] hover:bg-[color:var(--color-bg)]"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <CreditCard className="h-4 w-4" /> {label}
      </span>
      <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-[color:var(--color-border-strong)]"}`} />
    </button>
  );
}

function Line({ label, value, bold, tone }) {
  const cls = tone === "profit" ? "text-[color:var(--color-success)]" : "text-[color:var(--color-text)]";
  return (
    <div className="flex items-center justify-between">
      <span className="text-[color:var(--color-muted)]">{label}</span>
      <span className={`${bold ? "text-base font-bold" : "font-semibold"} ${cls}`}>{value}</span>
    </div>
  );
}
