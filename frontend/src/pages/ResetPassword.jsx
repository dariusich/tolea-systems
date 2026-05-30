import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import PageHelmet from "@/components/PageHelmet";

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => nav("/login", { replace: true }), 1800);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHelmet title="Reset password" />
      <section className="mx-auto max-w-md px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl tracking-tight text-zinc-900">Reset password</h1>
        <p className="mt-2 text-sm text-zinc-600">Pick a new password for your account.</p>

        {!token && (
          <p className="mt-6 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
            Missing reset token. Request a new link from the forgot password page.
          </p>
        )}

        {done ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800" data-testid="reset-success">
            Password updated. Redirecting you to sign in…
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="block text-xs font-medium text-zinc-700">New password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="reset-password"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-zinc-700">Confirm password</span>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                data-testid="reset-password-confirm"
                className={inputCls}
              />
            </label>
            {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
            <button
              type="submit"
              disabled={busy || !token}
              data-testid="reset-submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Back to sign in</Link>
        </p>
      </section>
    </>
  );
}

const inputCls =
  "mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
