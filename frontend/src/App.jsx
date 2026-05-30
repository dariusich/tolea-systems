import { HashRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Marketplace from "@/pages/Marketplace";
import ProductDetail from "@/pages/ProductDetail";
import LiveResults from "@/pages/LiveResults";
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
import LegacyDashboard from "@/pages/Dashboard";

import "@/App.css";

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Header />
          <main className="min-h-[60vh]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/systems" element={<Marketplace />} />
              <Route path="/systems/:slug" element={<ProductDetail />} />
              <Route path="/live-results" element={<LiveResults />} />
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
              <Route path="/accounts" element={<LegacyDashboard />} />
              <Route path="/a/:slug" element={<LegacyDashboard />} />
              <Route path="/share/:token" element={<LegacyDashboard />} />
              <Route path="/share/:token/a/:slug" element={<LegacyDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  );
}
