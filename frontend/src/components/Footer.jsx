import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-zinc-200 bg-zinc-50/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="inline-block h-6 w-6 rounded-md bg-zinc-900" />
              <span className="text-[15px] font-semibold tracking-tight text-zinc-900">Tolea Systems</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500">
              Carefully selected algorithmic trading systems with transparent performance and professional analytics.
            </p>
          </div>
          <FooterCol title="Product" links={[
            ["Marketplace", "/systems"],
            ["Live Results", "/live-results"],
            ["Comparison", "/compare"],
            ["Pricing", "/systems"],
          ]} />
          <FooterCol title="Resources" links={[
            ["Blog", "/blog"],
            ["FAQ", "/#faq"],
            ["Support", "/account"],
            ["Sign in", "/login"],
          ]} />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Tolea Systems. All rights reserved.</p>
          <p className="max-w-xl text-right">
            Trading involves risk. Past performance is not indicative of future results. Verified data is sourced from connected accounts; numbers reflect historical performance only.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-zinc-700">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link className="hover:text-zinc-900" to={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
