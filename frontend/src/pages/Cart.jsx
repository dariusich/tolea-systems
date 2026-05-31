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
      <main className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="container-prose py-14">
          <p className="eyebrow">Cart</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Your cart</h1>

          {items.length === 0 ? (
            <div className="mt-10 rounded-[14px] border border-dashed border-[color:var(--color-border-strong)] bg-white px-8 py-16 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-[color:var(--color-dim)]" />
              <p className="mt-4 text-sm text-[color:var(--color-muted)]">Your cart is empty.</p>
              <Link to="/systems" className="btn-gold mt-6">
                Browse products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
              <div className="space-y-3" data-testid="cart-items">
                {items.map((it) => (
                  <article key={it.slug} className="flex flex-col gap-4 rounded-[14px] border border-[color:var(--color-border)] bg-white p-4 sm:flex-row sm:items-center">
                    <div className="h-20 w-full overflow-hidden rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] sm:w-28">
                      {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/systems/${it.slug}`} className="text-base font-semibold text-[color:var(--color-text)] hover:text-[color:var(--color-accent)]">
                        {it.name}
                      </Link>
                      <p className="mt-1 text-sm text-[color:var(--color-muted)]">Digital product - optimized set files and setup guidance.</p>
                    </div>
                    <div className="flex w-fit items-center rounded-[10px] border border-[color:var(--color-border)] bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity(it.slug, it.quantity - 1)}
                        className="h-9 w-9 text-[color:var(--color-muted)] hover:bg-[color:var(--color-bg)]"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{it.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(it.slug, it.quantity + 1)}
                        className="h-9 w-9 text-[color:var(--color-muted)] hover:bg-[color:var(--color-bg)]"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-right text-sm font-semibold text-[color:var(--color-text)] sm:w-24">{money(it.price * it.quantity)}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(it.slug)}
                      aria-label="Remove"
                      className="grid h-9 w-9 place-items-center rounded-[10px] text-[color:var(--color-dim)] hover:bg-[rgba(214,59,44,0.08)] hover:text-[color:var(--color-danger)]"
                      data-testid={`cart-remove-${it.slug}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </article>
                ))}
                <button onClick={clear} className="mt-4 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]" data-testid={TID.cartClear}>
                  Clear cart
                </button>
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-[14px] border border-[color:var(--color-border)] bg-white p-6">
                  <p className="eyebrow">Order summary</p>
                  <div className="mt-5 flex items-center justify-between text-sm text-[color:var(--color-muted)]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[color:var(--color-text)]">{money(subtotal)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-[color:var(--color-muted)]">
                    <span>Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[color:var(--color-border)] pt-5 text-base">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold tracking-tight">{money(subtotal)}</span>
                  </div>
                  <button onClick={() => nav("/checkout")} data-testid={TID.cartCheckout} className="btn-gold mt-6 w-full">
                    Continue to checkout <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-3 text-center text-xs text-[color:var(--color-dim)]">Demo-safe checkout. No payment is charged.</p>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
