import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import PageHelmet from "@/components/PageHelmet";
import { TID } from "@/lib/testIds";

export default function Signup() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await register(form.name, form.email, form.password);
    setBusy(false);
    if (res.ok) nav("/account", { replace: true });
    else setError(res.error);
  };

  return (
    <>
      <PageHelmet title="Create account" />
      <section className="mx-auto max-w-md px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl tracking-tight text-zinc-900">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-600">Get started — purchases and downloads stay in your account.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Full name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              data-testid={TID.signupName}
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              data-testid={TID.signupEmail}
              className={inputCls}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              data-testid={TID.signupPassword}
              className={inputCls}
            />
          </Field>

          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700" data-testid="signup-error">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            data-testid={TID.signupSubmit}
            className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)]">Sign in</Link>
        </p>
      </section>
    </>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(200,155,90,0.20)]";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-zinc-700">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
