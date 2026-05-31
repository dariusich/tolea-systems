import { HashRouter, Routes, Route, useLocation } from "react-router-dom";

import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Marketplace from "@/pages/Marketplace";
import ProductDetail from "@/pages/ProductDetail";
import Compare from "@/pages/Compare";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Invoice from "@/pages/Invoice";
import CheckoutReturn from "@/pages/CheckoutReturn";
import CustomerDashboard from "@/pages/CustomerDashboard";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Contact from "@/pages/Contact";

import "@/App.css";

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const dashboardRoute =
    location.pathname === "/accounts" ||
    location.pathname.startsWith("/a/") ||
    location.pathname.startsWith("/live-results") ||
    location.pathname.startsWith("/share/");

  return (
    <>
      <ScrollToTop />
      {!dashboardRoute && <Header />}
      <main className={dashboardRoute ? "min-h-screen" : "min-h-[60vh]"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/systems" element={<Marketplace />} />
          <Route path="/systems/:slug" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/live-results" element={<Dashboard />} />
          <Route path="/live-results/a/:slug" element={<Dashboard />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/return" element={<CheckoutReturn />} />
          <Route path="/order/:id" element={<OrderSuccess />} />
          <Route path="/invoice/:id" element={<Invoice />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/accounts" element={<Dashboard />} />
          <Route path="/a/:slug" element={<Dashboard />} />
          <Route path="/share/:token" element={<Dashboard />} />
          <Route path="/share/:token/a/:slug" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!dashboardRoute && <Footer />}
    </>
  );
}
