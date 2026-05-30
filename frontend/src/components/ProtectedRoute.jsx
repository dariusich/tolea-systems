import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, ready } = useAuth();
  const loc = useLocation();

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-zinc-400">
        Checking session…
      </div>
    );
  }
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  }
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
