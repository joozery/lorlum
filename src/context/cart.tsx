"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CartItem {
  productId: string;
  productName: string;
  imageUrl: string;
  color: string;
  colorHex: string;
  size: number | null;
  price: number;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (productId: string, color: string, size: number | null) => void;
  updateQty: (productId: string, color: string, size: number | null, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "lorlum_cart";

function key(item: Pick<CartItem, "productId" | "color" | "size">) {
  return `${item.productId}::${item.color}::${item.size ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((newItem: Omit<CartItem, "qty"> & { qty?: number }) => {
    setItems((prev) => {
      const k = key(newItem);
      const exists = prev.find((i) => key(i) === k);
      if (exists) {
        return prev.map((i) => key(i) === k ? { ...i, qty: i.qty + (newItem.qty ?? 1) } : i);
      }
      return [...prev, { ...newItem, qty: newItem.qty ?? 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string, color: string, size: number | null) => {
    setItems((prev) => prev.filter((i) => key(i) !== key({ productId, color, size })));
  }, []);

  const updateQty = useCallback((productId: string, color: string, size: number | null, qty: number) => {
    if (qty <= 0) { removeItem(productId, color, size); return; }
    setItems((prev) => prev.map((i) => key(i) === key({ productId, color, size }) ? { ...i, qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const count    = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
