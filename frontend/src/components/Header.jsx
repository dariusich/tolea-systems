import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { TID } from "@/lib/testIds";

const navLink = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-[color:var(--color-accent-hover)]" : "text-slate-500 hover:text-slate-950"}`;

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header
      data-testid={TID.header}
      className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" data-testid={TID.navLogo} className="flex items-center gap-2">
          <span className="inline-grid h-7 w-7 place-items-center rounded-lg bg-[linear-gradient(135deg,#E7C88F,#B88745)] text-[10px] font-black tracking-[-0.08em] text-white">TS</span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-950">Tolea Systems</span>
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
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-[color:var(--color-accent-light)] hover:text-[color:var(--color-accent-hover)]"
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
                <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-950">
                  Admin
                </Link>
              )}
              <Link
                to="/account"
                data-testid={TID.navAccount}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-[color:var(--color-accent-light)] hover:text-[color:var(--color-accent-hover)]"
              >
                <User className="h-3.5 w-3.5" />
                {user.name?.split(" ")[0] || "Account"}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-slate-500 hover:text-slate-950"
                data-testid="nav-logout"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid={TID.navSignIn} className="text-sm text-slate-600 hover:text-slate-950">
                Sign in
              </Link>
              <Link
                to="/contact"
                data-testid={TID.navGetStarted}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[color:var(--color-accent-hover)]"
              >
                Get access
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-700 lg:hidden"
          data-testid="nav-mobile-toggle"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
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
                <button onClick={logout} className="text-left text-sm text-slate-500">Sign out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)} className={navLink}>Sign in</NavLink>
                <NavLink to="/contact" onClick={() => setOpen(false)} className={navLink}>Get access</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
