import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "tolea_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.slug === product.slug);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = (slug) => setItems((prev) => prev.filter((p) => p.slug !== slug));
  const setQuantity = (slug, q) =>
    setItems((prev) => prev.map((p) => (p.slug === slug ? { ...p, quantity: Math.max(1, q) } : p)));
  const clear = () => setItems([]);

  const { subtotal, count } = useMemo(() => {
    const sub = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const c = items.reduce((s, it) => s + it.quantity, 0);
    return { subtotal: sub, count: c };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQuantity, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
