import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import PageHelmet from "@/components/PageHelmet";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then(({ data }) => setProducts((data.products || []).slice(0, 3)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHelmet title="Products" description="Three professional MT4 Expert Advisors with live-result verification." />
      <main className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="border-b border-[color:var(--color-border)] bg-grid-gold">
          <div className="container-prose py-16">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent)] hover:text-[color:var(--color-text)]">
              <ArrowLeft className="h-4 w-4" />
              Back to overview
            </Link>
            <div className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="eyebrow">Products</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Tolea Systems Expert Advisors</h1>
                <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--color-muted)]">
                  A compact product catalog with three MT4 systems, optimized set files, result links, and clear risk context.
                </p>
              </div>
              <div className="chip-success">
                <ShieldCheck className="h-4 w-4" />
                Myfxbook proof-first
              </div>
            </div>
          </div>
        </section>

        <section className="container-prose py-12">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-[420px] animate-pulse rounded-[14px] border border-[color:var(--color-border)] bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}

          <p className="mt-8 rounded-[14px] border border-[color:var(--color-border)] bg-white p-4 text-sm font-medium leading-relaxed text-[color:var(--color-muted)]">
            Trading involves risk. Past performance does not guarantee future results. Expert Advisors can generate drawdown, especially in volatile market conditions. Use proper risk management.
          </p>
        </section>
      </main>
    </>
  );
}
