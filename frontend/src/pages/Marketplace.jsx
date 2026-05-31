import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import PageHelmet from "@/components/PageHelmet";
import { TID } from "@/lib/testIds";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "monthly_return", label: "Monthly return" },
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const RISK = ["Low", "Moderate", "High"];
const PLATFORMS = ["MT4", "MT5"];

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "featured";
  const platform = searchParams.get("platform") || "";
  const risk = searchParams.get("risk") || "";

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort };
    if (query) params.q = query;
    if (category && category !== "all") params.category = category;
    if (platform) params.platform = platform;
    if (risk) params.risk = risk;
    api
      .get("/products", { params })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [query, category, sort, platform, risk]);

  const update = (k, v) => {
    const next = new URLSearchParams(searchParams);
    if (!v || v === "all") next.delete(k);
    else next.set(k, v);
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <PageHelmet title="Marketplace" description="Browse professional algorithmic trading systems and indicators." />
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Marketplace</p>
          <h1 className="font-display mt-2 text-4xl leading-tight text-zinc-900 sm:text-5xl">
            Trading systems & indicators
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
            A curated catalogue of EAs, indicators, set files and full portfolio systems — every one with verified performance and risk-aware engineering.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-7">
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Search</label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => update("q", e.target.value)}
                  placeholder="Search systems…"
                  data-testid={TID.marketplaceSearch}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(200,155,90,0.20)]"
                />
              </div>
            </div>

            <FilterGroup title="Category">
              <FilterOption active={category === "all"} onClick={() => update("category", null)} label="All systems" testId={TID.marketplaceCategory + "-all"} />
              {categories.map((c) => (
                <FilterOption
                  key={c.slug}
                  active={category === c.slug}
                  onClick={() => update("category", c.slug)}
                  label={c.name}
                  testId={`${TID.marketplaceCategory}-${c.slug}`}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Platform">
              <FilterOption active={platform === ""} onClick={() => update("platform", null)} label="All platforms" testId="filter-platform-all" />
              {PLATFORMS.map((p) => (
                <FilterOption key={p} active={platform === p} onClick={() => update("platform", p)} label={p} testId={`filter-platform-${p}`} />
              ))}
            </FilterGroup>

            <FilterGroup title="Risk level">
              <FilterOption active={risk === ""} onClick={() => update("risk", null)} label="Any risk" testId="filter-risk-all" />
              {RISK.map((r) => (
                <FilterOption key={r} active={risk === r} onClick={() => update("risk", r)} label={r} testId={`filter-risk-${r}`} />
              ))}
            </FilterGroup>
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">
                {loading ? "Loading…" : `${products.length} system${products.length === 1 ? "" : "s"}`}
              </p>
              <div className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                <select
                  value={sort}
                  onChange={(e) => update("sort", e.target.value)}
                  data-testid={TID.marketplaceSort}
                  className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[rgba(200,155,90,0.20)]"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <SkeletonGrid />
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center text-sm text-zinc-500">
                No systems match these filters.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">{title}</p>
      <div className="mt-2 flex flex-col gap-1">{children}</div>
    </div>
  );
}

function FilterOption({ active, onClick, label, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
        active ? "bg-[color:var(--color-accent-light)] text-[color:var(--color-accent-hover)]" : "text-zinc-700 hover:bg-zinc-50"
      }`}
    >
      <span>{label}</span>
      {active && <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50" />
      ))}
    </div>
  );
}
