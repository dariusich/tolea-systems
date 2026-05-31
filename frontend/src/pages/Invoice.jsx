import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { money, shortDate } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";

export default function Invoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}/invoice`)
      .then(({ data }) => setInvoice(data.invoice))
      .catch((e) => setError(formatApiError(e)));
  }, [id]);

  if (error) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl tracking-tight text-zinc-900">Invoice unavailable</h1>
        <p className="mt-3 text-sm text-zinc-600">{error}</p>
        <Link to="/account" className="mt-6 inline-block text-sm text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)]">Back to orders</Link>
      </section>
    );
  }
  if (!invoice) return <div className="mx-auto max-w-3xl px-6 py-20 text-sm text-zinc-400">Loading invoice…</div>;

  const onPrint = () => window.print();

  return (
    <>
      <PageHelmet title={`Invoice ${invoice.invoice_number}`} />
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; }
          .invoice-page { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-10 border-b border-zinc-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to={`/order/${id}`} className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" /> Back to order
          </Link>
          <button
            type="button"
            onClick={onPrint}
            data-testid="invoice-print"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <article className="invoice-page rounded-2xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-sm" data-testid="invoice-page">
          {/* Header */}
          <header className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-6 w-6 rounded-md bg-zinc-900" />
                <span className="text-base font-semibold tracking-tight text-zinc-900">Tolea Systems</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{invoice.issuer.email}</p>
              <p className="text-xs text-zinc-500">{invoice.issuer.site}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Invoice</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">{invoice.invoice_number}</p>
              <p className="mt-1 text-xs text-zinc-500">Order {invoice.order_number}</p>
              <p className="mt-1 text-xs text-zinc-500">Issued {shortDate(invoice.issued_at)}</p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${
                  invoice.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </header>

          {/* Parties */}
          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-b border-zinc-100 py-8">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">Bill to</p>
              <p className="mt-2 text-sm font-medium text-zinc-900">{invoice.bill_to.name || "—"}</p>
              <p className="text-sm text-zinc-600">{invoice.bill_to.email}</p>
              {invoice.bill_to.address && <p className="mt-2 text-sm text-zinc-600">{invoice.bill_to.address}</p>}
              {(invoice.bill_to.city || invoice.bill_to.zip) && (
                <p className="text-sm text-zinc-600">
                  {[invoice.bill_to.city, invoice.bill_to.zip].filter(Boolean).join(", ")}
                </p>
              )}
              {invoice.bill_to.country && <p className="text-sm text-zinc-600">{invoice.bill_to.country}</p>}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">Payment</p>
              <p className="mt-2 text-sm text-zinc-900">
                {invoice.payment_method === "stripe" ? "Card · Stripe" : invoice.payment_method?.replace("_demo", " · demo")}
              </p>
            </div>
          </div>

          {/* Items */}
          <table className="mt-8 w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 text-right font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Unit</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {invoice.items.map((it) => (
                <tr key={it.product_slug}>
                  <td className="py-3 text-zinc-800">{it.name}</td>
                  <td className="py-3 text-right text-zinc-700">{it.quantity}</td>
                  <td className="py-3 text-right text-zinc-700">{money(it.price)}</td>
                  <td className="py-3 text-right font-medium text-zinc-900">{money(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <dl className="w-full max-w-xs space-y-1.5 text-sm">
              <Row label="Subtotal" value={money(invoice.subtotal)} />
              {invoice.discount > 0 && (
                <Row label={`Discount${invoice.coupon ? ` (${invoice.coupon})` : ""}`} value={`− ${money(invoice.discount)}`} tone="profit" />
              )}
              <div className="my-2 h-px bg-zinc-200" />
              <Row label="Total" value={money(invoice.total)} bold />
            </dl>
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-zinc-100 pt-6 text-xs leading-relaxed text-zinc-500">
            Thank you for your purchase. Digital products are delivered immediately to your account at toleasystems.com/account. This invoice serves as a receipt — no signature required.
          </footer>
        </article>
      </section>
    </>
  );
}

function Row({ label, value, bold, tone }) {
  const cls = tone === "profit" ? "text-emerald-600" : "text-zinc-900";
  return (
    <div className="flex items-center justify-between">
      <dt className="text-zinc-600">{label}</dt>
      <dd className={`${bold ? "text-base font-semibold" : ""} ${cls}`}>{value}</dd>
    </div>
  );
}
