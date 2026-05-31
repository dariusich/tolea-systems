import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto max-w-[76rem] px-5 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2" aria-label="Tolea Systems">
              <BrandLogo compact className="max-w-[172px]" />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[color:var(--color-muted)]">
              Optimized Expert Advisors, custom set files, setup guidance, and transparent live-result tracking.
            </p>
          </div>
          <FooterCol title="Product" links={[
            ["Products", "/systems"],
            ["Live Results", "/live-results"],
            ["Cart", "/cart"],
            ["Contact", "/contact"],
          ]} />
          <FooterCol title="Resources" links={[
            ["Overview", "/"],
            ["Calendar", "/live-results#calendar"],
            ["Trades", "/live-results#trades"],
            ["Sign in", "/login"],
          ]} />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[color:var(--color-border)] pt-6 text-xs text-[color:var(--color-dim)] sm:flex-row sm:items-center">
          <p>Copyright {new Date().getFullYear()} Tolea Systems. All rights reserved.</p>
          <p className="max-w-xl text-left sm:text-right">
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent)]">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm text-[color:var(--color-muted)]">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link className="hover:text-[color:var(--color-text)]" to={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
