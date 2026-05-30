import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { api, formatApiError } from "@/lib/api";

const EMPTY = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  category: "scalping",
  strategy_type: "Scalping",
  platform: ["MT5"],
  symbols: ["EURUSD"],
  timeframe: "M15",
  min_deposit: 1000,
  recommended_leverage: "1:100",
  risk_level: "Moderate",
  price: 299,
  compare_at_price: 0,
  monthly_return: 5,
  drawdown: 8,
  win_rate: 60,
  profit_factor: 2,
  image: "",
  features: [],
  kind: "ea",
  featured: false,
};

const RISKS = ["Low", "Moderate", "High", "User defined"];
const KINDS = ["ea", "indicator", "setfile"];

export default function ProductFormModal({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!editing;

  useEffect(() => {
    if (open) {
      setError("");
      setForm({
        ...EMPTY,
        ...(editing || {}),
        platform: editing?.platform || EMPTY.platform,
        symbols: editing?.symbols || EMPTY.symbols,
        features: editing?.features || [],
        compare_at_price: editing?.compare_at_price ?? 0,
      });
    }
  }, [open, editing]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setList = (k, str) => set(k, str.split(",").map((s) => s.trim()).filter(Boolean));
  const setFeatures = (str) => set("features", str.split("\n").map((s) => s.trim()).filter(Boolean));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        min_deposit: Number(form.min_deposit) || 0,
        price: Number(form.price) || 0,
        compare_at_price: Number(form.compare_at_price) || null,
        monthly_return: Number(form.monthly_return) || 0,
        drawdown: Number(form.drawdown) || 0,
        win_rate: Number(form.win_rate) || 0,
        profit_factor: Number(form.profit_factor) || 0,
      };
      if (isEdit) {
        // Slug not editable via PATCH; remove it
        const { slug: _, ...patch } = payload;
        await api.patch(`/admin/products/${editing.slug}`, patch);
      } else {
        await api.post("/admin/products", payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/40 p-4 backdrop-blur-sm" data-testid="product-form-modal">
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            {isEdit ? `Edit · ${editing.name}` : "New product"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={submit} className="space-y-5 px-6 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input className={inp} required value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="pf-name" />
            </Field>
            <Field label="Slug">
              <input
                className={inp}
                required
                disabled={isEdit}
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                data-testid="pf-slug"
              />
            </Field>
            <Field label="Tagline" full>
              <input className={inp} required value={form.tagline} onChange={(e) => set("tagline", e.target.value)} data-testid="pf-tagline" />
            </Field>
            <Field label="Description" full>
              <textarea className={`${inp} min-h-[80px] py-2`} required value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="pf-description" />
            </Field>

            <Field label="Category">
              <select className={inp} value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="pf-category">
                {["gold", "scalping", "grid", "prop-firm", "indicators", "set-files", "portfolio"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Kind">
              <select className={inp} value={form.kind} onChange={(e) => set("kind", e.target.value)} data-testid="pf-kind">
                {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="Strategy type">
              <input className={inp} value={form.strategy_type} onChange={(e) => set("strategy_type", e.target.value)} />
            </Field>
            <Field label="Risk level">
              <select className={inp} value={form.risk_level} onChange={(e) => set("risk_level", e.target.value)}>
                {RISKS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>

            <Field label="Platforms (comma-sep)">
              <input className={inp} value={form.platform.join(", ")} onChange={(e) => setList("platform", e.target.value)} />
            </Field>
            <Field label="Symbols (comma-sep)">
              <input className={inp} value={form.symbols.join(", ")} onChange={(e) => setList("symbols", e.target.value)} />
            </Field>
            <Field label="Timeframe">
              <input className={inp} value={form.timeframe} onChange={(e) => set("timeframe", e.target.value)} />
            </Field>
            <Field label="Recommended leverage">
              <input className={inp} value={form.recommended_leverage} onChange={(e) => set("recommended_leverage", e.target.value)} />
            </Field>

            <Field label="Price (USD)">
              <input type="number" className={inp} value={form.price} onChange={(e) => set("price", e.target.value)} data-testid="pf-price" />
            </Field>
            <Field label="Compare at price (USD, optional)">
              <input type="number" className={inp} value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} />
            </Field>
            <Field label="Min deposit (USD)">
              <input type="number" className={inp} value={form.min_deposit} onChange={(e) => set("min_deposit", e.target.value)} />
            </Field>
            <Field label="Image URL">
              <input className={inp} value={form.image} onChange={(e) => set("image", e.target.value)} />
            </Field>

            <Field label="Monthly return %">
              <input type="number" step="0.1" className={inp} value={form.monthly_return} onChange={(e) => set("monthly_return", e.target.value)} />
            </Field>
            <Field label="Drawdown %">
              <input type="number" step="0.1" className={inp} value={form.drawdown} onChange={(e) => set("drawdown", e.target.value)} />
            </Field>
            <Field label="Win rate %">
              <input type="number" step="0.1" className={inp} value={form.win_rate} onChange={(e) => set("win_rate", e.target.value)} />
            </Field>
            <Field label="Profit factor">
              <input type="number" step="0.01" className={inp} value={form.profit_factor} onChange={(e) => set("profit_factor", e.target.value)} />
            </Field>

            <Field label="Features (one per line)" full>
              <textarea className={`${inp} min-h-[100px] py-2`} value={form.features.join("\n")} onChange={(e) => setFeatures(e.target.value)} />
            </Field>

            <label className="col-span-full inline-flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} data-testid="pf-featured" />
              Featured on homepage
            </label>
          </div>

          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700" data-testid="pf-error">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              data-testid="pf-submit"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {busy ? "Saving…" : isEdit ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp =
  "h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-zinc-100 disabled:text-zinc-500";

function Field({ label, children, full }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
