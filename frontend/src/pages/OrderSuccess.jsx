import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, Download, ArrowRight, FileText, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { money, shortDate } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";

export default function OrderSuccess() {
  const { id } = useParams();
  const loc = useLocation();
  const [order, setOrder] = useState(loc.state?.order || null);

  useEffect(() => {
    if (order) return;
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(() => {});
  }, [id, order]);

  if (!order) return <div className="mx-auto max-w-3xl px-6 py-20 text-sm text-zinc-400">Loading order…</div>;

  return (
    <>
      <PageHelmet title={`Order ${order.order_number}`} />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8" data-testid="order-success">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="font-display mt-6 text-center text-4xl tracking-tight text-zinc-900">
          Order confirmed
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Thanks {order.customer_name || "trader"} — your purchase is complete. A receipt has been emailed to{" "}
          <span className="font-medium text-zinc-900">{order.customer_email}</span>.
        </p>

        <p className="mx-auto mt-3 inline-flex max-w-md items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] text-zinc-500">
          <Mail className="h-3 w-3" /> Demo mode: no email receipt or license is created yet.
        </p>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Order</p>
              <p className="mt-1 font-semibold text-zinc-900">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Placed</p>
              <p className="mt-1 text-zinc-700">{shortDate(order.created_at)}</p>
            </div>
          </div>

          <ul className="mt-6 divide-y divide-zinc-100">
            {order.items.map((it) => (
              <li key={it.product_slug} className="flex items-center gap-4 py-4">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-zinc-100 text-sm font-medium text-zinc-700">
                  {it.quantity}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">{it.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">License · Lifetime updates</p>
                </div>
                <a
                  href={it.download_url}
                  data-testid={`order-download-${it.product_slug}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={(e) => {
                    // demo: prevent dead-link navigation
                    e.preventDefault();
                    alert(`Demo: download for ${it.name} would start here.`);
                  }}
                >
                  <Download className="h-3 w-3" /> Download
                </a>
                <span className="w-20 text-right text-sm text-zinc-700">{money(it.line_total)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-zinc-100 pt-4 text-sm">
            <Line label="Subtotal" value={money(order.subtotal)} />
            {order.discount > 0 && <Line label={`Discount ${order.coupon ? `(${order.coupon})` : ""}`} value={`− ${money(order.discount)}`} tone="profit" />}
            <Line label="Total" value={money(order.total)} bold />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            View my downloads <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={`/invoice/${order.id}`}
            data-testid="order-view-invoice"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            <FileText className="h-4 w-4" /> View invoice
          </Link>
          <Link
            to="/systems"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Continue browsing
          </Link>
        </div>
      </section>
    </>
  );
}

function Line({ label, value, bold, tone }) {
  const cls = tone === "profit" ? "text-emerald-600" : "text-zinc-900";
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={`${bold ? "text-base font-semibold" : ""} ${cls}`}>{value}</span>
    </div>
  );
}
