import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/blog").then(({ data }) => setPosts(data.posts));
  }, []);

  const [hero, ...rest] = posts;

  return (
    <>
      <PageHelmet title="Blog" description="Research, performance reports, and notes on building risk-aware trading systems." />
      <section className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Journal</p>
          <h1 className="font-display mt-2 text-4xl leading-tight text-zinc-900 sm:text-5xl">
            Research, notes, and updates.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
            Short essays on system selection, risk management, and the engineering behind the systems we publish.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {hero && (
          <Link
            to={`/blog/${hero.slug}`}
            className="group grid gap-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 sm:grid-cols-[1.4fr_1fr] sm:p-8"
            data-testid={`blog-hero-${hero.slug}`}
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-600">{hero.category}</p>
              <h2 className="font-display mt-3 text-3xl leading-tight tracking-tight text-zinc-900 transition-colors group-hover:text-blue-700 sm:text-4xl">
                {hero.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">{hero.excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-xs text-zinc-500">
                <span>{shortDate(hero.published_at)}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-300" />
                <span>{hero.read_minutes} min read</span>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl bg-zinc-100">
              <img src={hero.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          </Link>
        )}

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="group" data-testid={`blog-post-${p.slug}`}>
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
                <img src={p.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-blue-600">{p.category}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-blue-700">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{p.excerpt}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs text-zinc-500">
                {shortDate(p.published_at)} · {p.read_minutes} min read <ArrowRight className="h-3 w-3" />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
