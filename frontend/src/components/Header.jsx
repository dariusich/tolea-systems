import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { TID } from "@/lib/testIds";
import BrandLogo from "@/components/BrandLogo";

const navLink = ({ isActive }) =>
  `text-[15px] font-medium transition-colors ${isActive ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]"}`;

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header
      data-testid={TID.header}
      className="sticky top-0 z-40 w-full border-b border-[color:var(--color-border)] bg-white/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[76rem] items-center justify-between px-5">
        <Link to="/" data-testid={TID.navLogo} className="flex items-center gap-2.5" aria-label="Tolea Systems">
          <BrandLogo compact className="max-w-[168px]" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink to="/" data-testid="nav-overview" className={navLink}>
            Overview
          </NavLink>
          <NavLink to="/systems" data-testid={TID.navMarketplace} className={navLink}>
            Products
          </NavLink>
          <NavLink to="/live-results" data-testid={TID.navLiveResults} className={navLink}>
            Live Results
          </NavLink>
          <NavLink to="/live-results#calendar" className={navLink}>Calendar</NavLink>
          <NavLink to="/live-results#trades" className={navLink}>Trades</NavLink>
          <NavLink to="/live-results#analytics" className={navLink}>Analytics</NavLink>
          <NavLink to="/contact" className={navLink}>Contact</NavLink>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/cart"
            data-testid={TID.navCart}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[color:var(--color-border)] text-[color:var(--color-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[color:var(--color-accent)] text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]">
                  Admin
                </Link>
              )}
              <Link
                to="/account"
                data-testid={TID.navAccount}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--color-border)] px-3 py-1.5 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
              >
                <User className="h-3.5 w-3.5" />
                {user.name?.split(" ")[0] || "Account"}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]"
                data-testid="nav-logout"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid={TID.navSignIn} className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]">
                Sign in
              </Link>
              <Link
                to="/systems"
                data-testid={TID.navGetStarted}
                className="inline-flex items-center justify-center rounded-[10px] bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(184,127,54,0.20)] hover:bg-[color:var(--color-accent-hover)]"
              >
                Buy EAs
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-md text-[color:var(--color-text)] lg:hidden"
          data-testid="nav-mobile-toggle"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[color:var(--color-border)] bg-white px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/" onClick={() => setOpen(false)} className={navLink}>Overview</NavLink>
            <NavLink to="/systems" onClick={() => setOpen(false)} className={navLink}>Products</NavLink>
            <NavLink to="/live-results" onClick={() => setOpen(false)} className={navLink}>Live Results</NavLink>
            <NavLink to="/live-results#calendar" onClick={() => setOpen(false)} className={navLink}>Calendar</NavLink>
            <NavLink to="/live-results#trades" onClick={() => setOpen(false)} className={navLink}>Trades</NavLink>
            <NavLink to="/live-results#analytics" onClick={() => setOpen(false)} className={navLink}>Analytics</NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)} className={navLink}>Contact</NavLink>
            <NavLink to="/cart" onClick={() => setOpen(false)} className={navLink}>Cart ({count})</NavLink>
            {user ? (
              <>
                <NavLink to="/account" onClick={() => setOpen(false)} className={navLink}>Account</NavLink>
                {user.role === "admin" && <NavLink to="/admin" onClick={() => setOpen(false)} className={navLink}>Admin</NavLink>}
                <button onClick={logout} className="text-left text-sm text-[color:var(--color-muted)]">Sign out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)} className={navLink}>Sign in</NavLink>
                <NavLink to="/systems" onClick={() => setOpen(false)} className={navLink}>Buy EAs</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
