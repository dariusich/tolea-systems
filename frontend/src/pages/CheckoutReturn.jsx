import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cart";
import PageHelmet from "@/components/PageHelmet";

const MAX_ATTEMPTS = 10;
const INTERVAL_MS = 2000;

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const nav = useNavigate();
  const { clear } = useCart();
  const [state, setState] = useState({ status: "polling", message: "Confirming your payment…", attempts: 0 });
  const cancelled = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error", message: "Missing session reference." });
      return;
    }
    let attempts = 0;
    const poll = async () => {
      if (cancelled.current) return;
      attempts += 1;
      try {
        const { data } = await api.get(`/checkout/stripe/status/${sessionId}`);
        if (data.payment_status === "paid" && data.order_id) {
          clear();
          nav(`/order/${data.order_id}`, { replace: true });
          return;
        }
        if (data.status === "expired" || data.status === "canceled") {
          setState({ status: "error", message: "Payment was cancelled or expired." });
          return;
        }
        if (attempts >= MAX_ATTEMPTS) {
          setState({
            status: "error",
            message: "We couldn't confirm payment yet. Check your email or contact support.",
          });
          return;
        }
        setState({ status: "polling", message: `Confirming your payment… (${attempts}/${MAX_ATTEMPTS})`, attempts });
        setTimeout(poll, INTERVAL_MS);
      } catch (e) {
        setState({ status: "error", message: e.response?.data?.detail || "Couldn't reach the payment server." });
      }
    };
    poll();
    return () => {
      cancelled.current = true;
    };
  }, [sessionId, nav, clear]);

  return (
    <>
      <PageHelmet title="Confirming payment" />
      <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8" data-testid="checkout-return">
        {state.status === "polling" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <h1 className="font-display mt-6 text-3xl tracking-tight text-zinc-900">Confirming payment</h1>
            <p className="mt-2 text-sm text-zinc-600">{state.message}</p>
          </>
        )}
        {state.status === "error" && (
          <>
            <XCircle className="h-8 w-8 text-rose-600" />
            <h1 className="font-display mt-6 text-3xl tracking-tight text-zinc-900">Payment not confirmed</h1>
            <p className="mt-2 text-sm text-zinc-600">{state.message}</p>
            <button
              type="button"
              onClick={() => nav("/checkout", { replace: true })}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Try again
            </button>
          </>
        )}
        {state.status === "ok" && (
          <>
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <h1 className="font-display mt-6 text-3xl tracking-tight text-zinc-900">Payment confirmed</h1>
          </>
        )}
      </section>
    </>
  );
}
