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
      .then(({ data }) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHelmet title="Products" description="Three professional MT4 Expert Advisors with live-result verification." />
      <section className="min-h-screen bg-[#F8F6EF] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#087F5B]">
                <ArrowLeft className="h-4 w-4" />
                Back to overview
              </Link>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#6B7280]">Products</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-[#111827] sm:text-5xl">Tolea Systems Expert Advisors</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#6B7280]">
                A focused catalog of three MT4 trading systems with external result links, product screenshots, and clear risk context.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-bold text-[#087F5B] shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Myfxbook proof-first
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-[360px] animate-pulse rounded-2xl border border-[#E7E4DA] bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}

          <p className="mt-8 rounded-xl border border-[#E7E4DA] bg-white px-4 py-3 text-sm font-semibold text-[#6B7280]">
            Trading involves risk. Past performance does not guarantee future results.
          </p>
        </div>
      </section>
    </>
  );
}
