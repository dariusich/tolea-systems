import { useEffect, useState } from "react";
import { LayoutDashboard, Package, ShoppingBag, Users, FileText, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { money, shortDate } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";
import ProductFormModal from "@/components/ProductFormModal";
import BlogFormModal from "@/components/BlogFormModal";
import { TID } from "@/lib/testIds";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, testId: TID.adminStats },
  { id: "products", label: "Products", icon: Package, testId: TID.adminProducts },
  { id: "orders", label: "Orders", icon: ShoppingBag, testId: "admin-orders" },
  { id: "customers", label: "Customers", icon: Users, testId: "admin-customers" },
  { id: "blog", label: "Blog", icon: FileText, testId: "admin-blog" },
];

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [productModal, setProductModal] = useState({ open: false, editing: null });
  const [blogModal, setBlogModal] = useState({ open: false, editing: null });
  const [blogPosts, setBlogPosts] = useState([]);

  const loadStats = () => api.get("/admin/stats").then(({ data }) => { setStats(data.stats); setRecent(data.recent_orders); });
  const loadProducts = () => api.get("/admin/products").then(({ data }) => setProducts(data.products));
  const loadOrders = () => api.get("/admin/orders").then(({ data }) => setOrders(data.orders));
  const loadCustomers = () => api.get("/admin/customers").then(({ data }) => setCustomers(data.customers));
  const loadBlog = () => api.get("/admin/blog").then(({ data }) => setBlogPosts(data.posts));

  useEffect(() => {
    loadStats();
    loadProducts();
    loadOrders();
    loadCustomers();
    loadBlog();
  }, []);

  const deleteProduct = async (slug) => {
    if (!window.confirm(`Delete product "${slug}"? This cannot be undone.`)) return;
    await api.delete(`/admin/products/${slug}`);
    loadProducts();
    loadStats();
  };

  const deleteBlogPost = async (slug) => {
    if (!window.confirm(`Delete post "${slug}"? This cannot be undone.`)) return;
    await api.delete(`/admin/blog/${slug}`);
    loadBlog();
  };

  const togglePublish = async (post) => {
    await api.patch(`/admin/blog/${post.slug}`, { published: !post.published });
    loadBlog();
  };

  return (
    <>
      <PageHelmet title="Admin" />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Admin</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight text-zinc-900">Operations</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav className="space-y-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
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
            {tab === "overview" && (
              <div className="space-y-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Revenue" value={money(stats?.revenue || 0)} />
                  <Stat label="Orders" value={stats?.orders || 0} />
                  <Stat label="Products" value={stats?.products || 0} />
                  <Stat label="Customers" value={stats?.customers || 0} />
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-100 p-5">
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900">Recent orders</h2>
                  </div>
                  <RecentOrders orders={recent} />
                </div>
              </div>
            )}

            {tab === "products" && (
              <ProductsTable
                products={products}
                onCreate={() => setProductModal({ open: true, editing: null })}
                onEdit={(p) => setProductModal({ open: true, editing: p })}
                onDelete={deleteProduct}
              />
            )}
            {tab === "orders" && (
              <div className="rounded-2xl border border-zinc-200 bg-white">
                <RecentOrders orders={orders} />
              </div>
            )}
            {tab === "customers" && <CustomersTable customers={customers} />}
            {tab === "blog" && (
              <BlogTable
                posts={blogPosts}
                onCreate={() => setBlogModal({ open: true, editing: null })}
                onEdit={(p) => setBlogModal({ open: true, editing: p })}
                onDelete={deleteBlogPost}
                onTogglePublish={togglePublish}
              />
            )}
          </div>
        </div>

        <ProductFormModal
          open={productModal.open}
          editing={productModal.editing}
          onClose={() => setProductModal({ open: false, editing: null })}
          onSaved={() => {
            loadProducts();
            loadStats();
          }}
        />
        <BlogFormModal
          open={blogModal.open}
          editing={blogModal.editing}
          onClose={() => setBlogModal({ open: false, editing: null })}
          onSaved={loadBlog}
        />
      </section>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

function RecentOrders({ orders }) {
  if (!orders.length) {
    return <p className="p-10 text-center text-sm text-zinc-400">No orders yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-zinc-50/60 text-left">
          <tr className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
            <th className="px-5 py-3 font-medium">Order</th>
            <th className="px-5 py-3 font-medium">Customer</th>
            <th className="px-5 py-3 font-medium">Items</th>
            <th className="px-5 py-3 font-medium">Total</th>
            <th className="px-5 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="px-5 py-3 font-medium text-zinc-900">{o.order_number}</td>
              <td className="px-5 py-3 text-zinc-700">{o.customer_email}</td>
              <td className="px-5 py-3 text-zinc-700">{o.items.length}</td>
              <td className="px-5 py-3 font-medium text-zinc-900">{money(o.total)}</td>
              <td className="px-5 py-3 text-zinc-500">{shortDate(o.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTable({ products, onCreate, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{products.length} products</p>
        <button
          type="button"
          onClick={onCreate}
          data-testid="admin-product-create"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-zinc-50/60 text-left">
            <tr className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Featured</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100" data-testid="admin-products-table">
            {products.map((p) => (
              <tr key={p.slug}>
                <td className="px-5 py-3">
                  <p className="font-medium text-zinc-900">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.slug}</p>
                </td>
                <td className="px-5 py-3 text-zinc-700">{p.category}</td>
                <td className="px-5 py-3 text-zinc-700">{money(p.price)}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.featured ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                    {p.featured ? "Featured" : "—"}
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-700">{p.rating?.toFixed(1) || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      data-testid={`admin-edit-${p.slug}`}
                      aria-label={`Edit ${p.name}`}
                      className="grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p.slug)}
                      data-testid={`admin-delete-${p.slug}`}
                      aria-label={`Delete ${p.name}`}
                      className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomersTable({ customers }) {
  if (!customers.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center text-sm text-zinc-500">
        No customers yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-zinc-50/60 text-left">
          <tr className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {customers.map((c) => (
            <tr key={c.id}>
              <td className="px-5 py-3 font-medium text-zinc-900">{c.name}</td>
              <td className="px-5 py-3 text-zinc-700">{c.email}</td>
              <td className="px-5 py-3 text-zinc-500">{shortDate(c.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlogTable({ posts, onCreate, onEdit, onDelete, onTogglePublish }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{posts.length} posts</p>
        <button
          type="button"
          onClick={onCreate}
          data-testid="admin-blog-create"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center text-sm text-zinc-500">
          No posts yet — write your first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-zinc-50/60 text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Author</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100" data-testid="admin-blog-table">
              {posts.map((p) => (
                <tr key={p.slug}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-zinc-900">{p.title}</p>
                    <p className="text-xs text-zinc-500">/{p.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-zinc-700">{p.category}</td>
                  <td className="px-5 py-3 text-zinc-700">{p.author}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.published === false ? "bg-zinc-100 text-zinc-600" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {p.published === false ? "Draft" : "Published"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-500">{shortDate(p.published_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onTogglePublish(p)}
                        aria-label={p.published === false ? "Publish" : "Unpublish"}
                        data-testid={`admin-blog-toggle-${p.slug}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        {p.published === false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        aria-label={`Edit ${p.title}`}
                        data-testid={`admin-blog-edit-${p.slug}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p.slug)}
                        aria-label={`Delete ${p.title}`}
                        data-testid={`admin-blog-delete-${p.slug}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
