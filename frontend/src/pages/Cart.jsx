import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";
import { TID } from "@/lib/testIds";

export default function Cart() {
  const { items, removeItem, setQuantity, subtotal, clear } = useCart();
  const nav = useNavigate();

  return (
    <>
      <PageHelmet title="Cart" />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Cart</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight text-zinc-900">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-8 py-16 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-4 text-sm text-zinc-600">Your cart is empty.</p>
            <Link
              to="/systems"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Browse systems <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3" data-testid="cart-items">
              {items.map((it) => (
                <article key={it.slug} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="h-16 w-24 overflow-hidden rounded-lg bg-zinc-100">
                    {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <Link to={`/systems/${it.slug}`} className="text-sm font-medium text-zinc-900 hover:text-blue-600">
                      {it.name}
                    </Link>
                    <p className="mt-1 text-xs text-zinc-500">Digital download · Lifetime updates</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(it.slug, it.quantity - 1)}
                      className="h-8 w-8 text-zinc-600 hover:bg-zinc-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{it.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(it.slug, it.quantity + 1)}
                      className="h-8 w-8 text-zinc-600 hover:bg-zinc-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-24 text-right text-sm font-medium text-zinc-900">{money(it.price * it.quantity)}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(it.slug)}
                    aria-label="Remove"
                    className="grid h-8 w-8 place-items-center rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-rose-600"
                    data-testid={`cart-remove-${it.slug}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              ))}
              <button onClick={clear} className="mt-4 text-xs text-zinc-500 hover:text-zinc-900" data-testid={TID.cartClear}>
                Clear cart
              </button>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Order summary</p>
                <div className="mt-4 flex items-center justify-between text-sm text-zinc-700">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900">{money(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-zinc-500">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 text-base">
                  <span className="font-medium text-zinc-900">Total</span>
                  <span className="text-lg font-semibold tracking-tight text-zinc-900">{money(subtotal)}</span>
                </div>
                <button
                  onClick={() => nav("/checkout")}
                  data-testid={TID.cartCheckout}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Continue to checkout <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
