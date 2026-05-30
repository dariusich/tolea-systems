import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CreditCard, Tag } from "lucide-react";
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

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const applyCoupon = async () => {
    setError("");
    if (!couponInput.trim()) return;
    // Demo: known coupon LAUNCH10
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
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <PageHelmet title="Checkout" />
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl tracking-tight text-zinc-900">Nothing to check out</h1>
          <p className="mt-3 text-sm text-zinc-600">Your cart is empty. Add a system from the marketplace first.</p>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHelmet title="Checkout" />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Secure checkout</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight text-zinc-900">Checkout</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <div className="space-y-8">
            <Section title="Contact">
              <Field label="Full name">
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  data-testid="checkout-name"
                  required
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  data-testid="checkout-email"
                  required
                />
              </Field>
            </Section>

            <Section title="Billing address">
              <Field label="Country">
                <input className={inputCls} value={form.country} onChange={(e) => update("country", e.target.value)} data-testid="checkout-country" />
              </Field>
              <Field label="Address">
                <input className={inputCls} value={form.address} onChange={(e) => update("address", e.target.value)} data-testid="checkout-address" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input className={inputCls} value={form.city} onChange={(e) => update("city", e.target.value)} data-testid="checkout-city" />
                </Field>
                <Field label="Postal code">
                  <input className={inputCls} value={form.zip} onChange={(e) => update("zip", e.target.value)} data-testid="checkout-zip" />
                </Field>
              </div>
            </Section>

            <Section title="Payment method">
              <div className="grid gap-2">
                <PaymentOption
                  active={form.payment_method === "stripe_demo"}
                  onClick={() => update("payment_method", "stripe_demo")}
                  label="Card checkout (demo)"
                  testId="payment-stripe"
                />
                <PaymentOption
                  active={form.payment_method === "paypal_demo"}
                  onClick={() => update("payment_method", "paypal_demo")}
                  label="PayPal (demo)"
                  testId="payment-paypal"
                />
              </div>
              {form.payment_method === "stripe_demo" && (
                <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500">
                  Demo checkout only. No card processor is connected yet and no real charge is made.
                </div>
              )}
            </Section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Order summary</p>
              <ul className="mt-4 space-y-3 border-b border-zinc-100 pb-4">
                {items.map((it) => (
                  <li key={it.slug} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-zinc-100 text-xs font-medium text-zinc-700">
                      {it.quantity}
                    </span>
                    <span className="flex-1 truncate text-sm text-zinc-900">{it.name}</span>
                    <span className="text-sm text-zinc-700">{money(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Coupon</p>
                <div className="mt-2 flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <input
                      placeholder="LAUNCH10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      data-testid={TID.checkoutCoupon}
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCoupon}
                    data-testid={TID.checkoutApplyCoupon}
                    className="rounded-lg border border-zinc-200 bg-white px-3 text-sm hover:bg-zinc-50"
                  >
                    Apply
                  </button>
                </div>
                {coupon && (
                  <p className="mt-2 text-xs text-emerald-600">
                    {coupon.code} applied — {coupon.percent_off}% off.
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4 text-sm">
                <Line label="Subtotal" value={money(subtotal)} />
                {discount > 0 && <Line label="Discount" value={`− ${money(discount)}`} tone="profit" />}
                <Line label="Total" value={money(total)} bold />
              </div>

              {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}

              <button
                type="button"
                onClick={placeOrder}
                disabled={submitting}
                data-testid={TID.checkoutPlaceOrder}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />{" "}
                {submitting
                  ? "Processing…"
                  : form.payment_method === "stripe_demo"
                    ? `Create demo order for ${money(total)}`
                    : `Create demo order for ${money(total)}`}
              </button>
              <p className="mt-3 text-center text-[11px] text-zinc-400">
                Demo mode · no real payment, account, email, or license is created.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-sm font-semibold tracking-tight text-zinc-900">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-zinc-600">{label}</span>
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
      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
        active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <CreditCard className="h-4 w-4" /> {label}
      </span>
      <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-zinc-300"}`} />
    </button>
  );
}

function Line({ label, value, bold, tone }) {
  const cls = tone === "profit" ? "text-emerald-600" : "text-zinc-900";
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-600">{label}</span>
      <span className={`${bold ? "text-base font-semibold" : "font-medium"} ${cls}`}>{value}</span>
    </div>
  );
}
