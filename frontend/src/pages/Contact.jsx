import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import PageHelmet from "@/components/PageHelmet";

const PRODUCTS = [
  { label: "AURIX", value: "AURIX" },
  { label: "MATrader AI", value: "MATrader AI" },
  { label: "QuickScalper", value: "QuickScalper" },
  { label: "Not sure yet", value: "Not sure yet" },
];

const SLUG_TO_PRODUCT = {
  "aurix-neural-edge-ai": "AURIX",
  "matrader-ai": "MATrader AI",
  "matrader-quickscalper": "QuickScalper",
};

export default function Contact() {
  const [params] = useSearchParams();
  const initialProduct = useMemo(() => SLUG_TO_PRODUCT[params.get("product")] || "Not sure yet", [params]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    product_interest: initialProduct,
    account_size: "",
    broker: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setSuccess(true);
      setForm({
        name: "",
        email: "",
        product_interest: initialProduct,
        account_size: "",
        broker: "",
        message: "",
      });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHelmet title="Contact" description="Request access or setup help for Tolea Systems Expert Advisors." />
      <main className="min-h-screen bg-[#F8F6EF] px-4 py-14 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E7E4DA] bg-white px-4 py-2 text-sm font-black text-[#087F5B]">
              <Mail className="h-4 w-4" />
              Contact
            </span>
            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-[#111827]">Get access or setup guidance.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#6B7280]">
              Request access, ask for setup help, or discuss the best EA configuration for your account.
            </p>
            <div className="mt-8 rounded-2xl border border-[#E7E4DA] bg-white p-5 text-sm leading-6 text-[#6B7280] shadow-sm">
              We will help you choose between Low Risk, Balanced, and Aggressive set file profiles based on account size, broker conditions, and your drawdown tolerance.
            </div>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_24px_70px_rgba(17,24,39,0.08)] sm:p-7">
            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-[#087F5B]">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                Your request was received. We will review your setup details and reply with the next steps.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="contact-input" placeholder="Your name" />
              </Field>
              <Field label="Email">
                <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="contact-input" placeholder="you@example.com" />
              </Field>
              <Field label="Product interest">
                <select value={form.product_interest} onChange={(e) => update("product_interest", e.target.value)} className="contact-input">
                  {PRODUCTS.map((product) => (
                    <option key={product.value} value={product.value}>{product.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Account size">
                <input value={form.account_size} onChange={(e) => update("account_size", e.target.value)} className="contact-input" placeholder="$500, $1,000, $5,000..." />
              </Field>
              <Field label="Broker">
                <input value={form.broker} onChange={(e) => update("broker", e.target.value)} className="contact-input" placeholder="Broker name" />
              </Field>
              <div />
            </div>

            <Field label="Message" className="mt-4">
              <textarea value={form.message} onChange={(e) => update("message", e.target.value)} className="contact-input min-h-36 py-3" placeholder="Tell us your account type, risk preference, and what you need help with." />
            </Field>

            {error && <p className="mt-4 text-sm font-bold text-[#EF4444]">{error}</p>}

            <button type="submit" disabled={submitting} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#087F5B] text-sm font-black text-white transition-colors hover:bg-[#059669] disabled:opacity-60">
              {submitting ? "Sending..." : "Send request"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6B7280]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
