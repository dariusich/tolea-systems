import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Package, Receipt, User as UserIcon, FileText, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { money, shortDate } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";
import { TID } from "@/lib/testIds";

const TABS = [
  { id: "downloads", label: "Downloads", icon: Download, testId: TID.dashDownloads },
  { id: "orders", label: "Orders", icon: Receipt, testId: TID.dashOrders },
  { id: "billing", label: "Billing history", icon: FileText, testId: "dash-billing" },
  { id: "profile", label: "Profile", icon: UserIcon, testId: "dash-profile" },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("downloads");
  const [orders, setOrders] = useState([]);
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data.orders)).catch(() => {});
    api.get("/me/downloads").then(({ data }) => setDownloads(data.downloads)).catch(() => {});
  }, []);

  return (
    <>
      <PageHelmet title="My account" />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">My account</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight text-zinc-900">Hi, {user?.name || "trader"}</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav className="space-y-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={t.testId}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </nav>

          <div>
            {tab === "downloads" && <DownloadsView downloads={downloads} />}
            {tab === "orders" && <OrdersView orders={orders} />}
            {tab === "billing" && <BillingView orders={orders} />}
            {tab === "profile" && <ProfileView user={user} />}
          </div>
        </div>
      </section>
    </>
  );
}

function DownloadsView({ downloads }) {
  if (downloads.length === 0) {
    return (
      <Empty
        icon={Package}
        title="No downloads yet"
        body="Once you purchase a system, download links appear here."
      />
    );
  }
  return (
    <div className="space-y-3" data-testid="downloads-list">
      {downloads.map((d) => (
        <article key={d.product_slug} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900">{d.name}</p>
            <p className="mt-1 text-xs text-zinc-500">
              Order {d.order_number} · {shortDate(d.purchased_at)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              alert(`Demo: download for ${d.name} would start here.`);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800"
            data-testid={`download-btn-${d.product_slug}`}
          >
            <Download className="h-3 w-3" /> Download
          </button>
        </article>
      ))}
    </div>
  );
}

function OrdersView({ orders }) {
  if (orders.length === 0) return <Empty icon={Receipt} title="No orders yet" body="Your purchases will be listed here." />;
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-zinc-50/60 text-left">
          <tr className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
            <th className="px-5 py-3 font-medium">Order</th>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Items</th>
            <th className="px-5 py-3 font-medium">Total</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="px-5 py-3">
                <Link to={`/order/${o.id}`} className="font-medium text-zinc-900 hover:text-blue-600">{o.order_number}</Link>
              </td>
              <td className="px-5 py-3 text-zinc-700">{shortDate(o.created_at)}</td>
              <td className="px-5 py-3 text-zinc-700">{o.items.length}</td>
              <td className="px-5 py-3 font-medium text-zinc-900">{money(o.total)}</td>
              <td className="px-5 py-3">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">{o.status}</span>
              </td>
              <td className="px-5 py-3 text-right">
                <Link to={`/invoice/${o.id}`} className="text-xs text-blue-600 hover:text-blue-700" data-testid={`order-invoice-link-${o.id}`}>
                  Invoice →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BillingView({ orders }) {
  if (orders.length === 0) return <Empty icon={FileText} title="No billing history" body="Your invoices appear here after your first purchase." />;
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  return (
    <div className="space-y-6" data-testid="billing-view">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total spent" value={money(totalSpent)} />
        <Stat label="Orders" value={orders.length} />
        <Stat label="Last order" value={shortDate(orders[0].created_at)} />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 p-5">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900">Invoices</h2>
          <p className="mt-1 text-xs text-zinc-500">Tap any invoice to view or print as PDF.</p>
        </div>
        <ul className="divide-y divide-zinc-100">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-zinc-900">INV-{o.order_number.split("-").pop()}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {shortDate(o.created_at)} · {o.items.length} item{o.items.length === 1 ? "" : "s"} · {money(o.total)}
                </p>
              </div>
              <Link
                to={`/invoice/${o.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                data-testid={`billing-invoice-${o.id}`}
              >
                <FileText className="h-3 w-3" /> View invoice
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[11px] text-zinc-400">
        <Mail className="mr-1 inline h-3 w-3" />
        Demo mode: email receipts and real licensing will be wired later.
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

function ProfileView({ user }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Profile</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Row label="Name" value={user?.name || "—"} />
        <Row label="Email" value={user?.email || "—"} />
        <Row label="Role" value={user?.role || "—"} />
      </dl>
      <p className="mt-6 text-xs text-zinc-500">Profile editing & password change coming soon.</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-900">{value}</p>
    </div>
  );
}

function Empty({ icon: Icon, title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-8 py-16 text-center">
      <Icon className="mx-auto h-8 w-8 text-zinc-400" />
      <p className="mt-4 text-sm font-medium text-zinc-700">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{body}</p>
    </div>
  );
}
