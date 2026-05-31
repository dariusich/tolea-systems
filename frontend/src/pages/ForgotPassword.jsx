import { useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import PageHelmet from "@/components/PageHelmet";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setDone(true);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHelmet title="Forgot password" />
      <section className="mx-auto max-w-md px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl tracking-tight text-zinc-900">Forgot password</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Enter your account email. In demo mode, this confirms the flow without sending email.
        </p>

        {done ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800" data-testid="forgot-success">
            If an account exists for <span className="font-medium">{email}</span>, the reset flow is accepted.
            <p className="mt-3 text-xs text-emerald-700">
              Demo mode: no email is sent and no password is changed.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="block text-xs font-medium text-zinc-700">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                data-testid="forgot-email"
                className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(200,155,90,0.20)]"
              />
            </label>

            {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              data-testid="forgot-submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)]">Sign in</Link>
        </p>
      </section>
    </>
  );
}
