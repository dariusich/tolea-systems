import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import PageHelmet from "@/components/PageHelmet";
import { TID } from "@/lib/testIds";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const next = sp.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      nav(res.user.role === "admin" ? "/admin" : next, { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <>
      <PageHelmet title="Sign in" />
      <section className="mx-auto max-w-md px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl tracking-tight text-zinc-900">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-600">Sign in to manage your purchases and downloads.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Email">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid={TID.loginEmail}
              className={inputCls}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid={TID.loginPassword}
              className={inputCls}
            />
          </Field>

          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700" data-testid="login-error">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            data-testid={TID.loginSubmit}
            className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-900" data-testid="login-forgot">
              Forgot your password?
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          New to Tolea?{" "}
          <Link to="/signup" className="font-medium text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)]">Create an account</Link>
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
