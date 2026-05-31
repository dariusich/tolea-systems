import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { api, formatApiError } from "@/lib/api";

const EMPTY = {
  slug: "",
  title: "",
  excerpt: "",
  category: "Trading Systems",
  cover: "",
  author: "Tolea Team",
  read_minutes: 5,
  content: "",
  published: true,
};

const CATEGORIES = [
  "Trading Systems",
  "Forex Education",
  "Risk Management",
  "Platform Updates",
  "Performance Reports",
];

export default function BlogFormModal({ open, onClose, onSaved, editing }) {
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
        published: editing ? editing.published !== false : true,
      });
    }
  }, [open, editing]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        read_minutes: Number(form.read_minutes) || 5,
      };
      if (isEdit) {
        const { slug: _, ...patch } = payload;
        await api.patch(`/admin/blog/${editing.slug}`, patch);
      } else {
        await api.post("/admin/blog", payload);
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/40 p-4 backdrop-blur-sm" data-testid="blog-form-modal">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            {isEdit ? `Edit · ${editing.title}` : "New post"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={submit} className="space-y-5 px-6 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title" full>
              <input className={inp} required value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="bf-title" />
            </Field>
            <Field label="Slug">
              <input
                className={inp}
                required
                disabled={isEdit}
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                data-testid="bf-slug"
              />
            </Field>
            <Field label="Category">
              <select className={inp} value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="bf-category">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Author">
              <input className={inp} value={form.author} onChange={(e) => set("author", e.target.value)} />
            </Field>
            <Field label="Read minutes">
              <input type="number" min="1" className={inp} value={form.read_minutes} onChange={(e) => set("read_minutes", e.target.value)} />
            </Field>
            <Field label="Cover image URL" full>
              <input className={inp} value={form.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Excerpt" full>
              <textarea className={`${inp} min-h-[60px] py-2`} required value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} data-testid="bf-excerpt" />
            </Field>
            <Field label="Content (plain text, line breaks preserved)" full>
              <textarea
                className={`${inp} min-h-[220px] py-2 font-mono text-[13px]`}
                required
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                data-testid="bf-content"
              />
            </Field>

            <label className="col-span-full inline-flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={!!form.published} onChange={(e) => set("published", e.target.checked)} data-testid="bf-published" />
              Published (visible to public)
            </label>
          </div>

          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700" data-testid="bf-error">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              data-testid="bf-submit"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {busy ? "Saving…" : isEdit ? "Save changes" : "Create post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp =
  "h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(200,155,90,0.20)] disabled:bg-zinc-100 disabled:text-zinc-500";

function Field({ label, children, full }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
