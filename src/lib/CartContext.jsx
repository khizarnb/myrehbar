import React, { createContext, useContext, useState, useEffect } from "react";
import CartDrawer from "@/components/CartDrawer";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("rehbar_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("rehbar_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, size, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.slug === product.slug && i.size === size);
      if (existing) {
        return prev.map(i =>
          i.slug === product.slug && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        slug: product.slug,
        title: product.title,
        price: product.price,
        image: product.heroImage,
        size,
        quantity
      }];
    });
  };

  const removeItem = (slug, size) => {
    setItems(prev => prev.filter(i => !(i.slug === slug && i.size === size)));
  };

  const updateQuantity = (slug, size, quantity) => {
    if (quantity <= 0) {
      removeItem(slug, size);
      return;
    }
    setItems(prev => prev.map(i =>
      i.slug === slug && i.size === size ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      cartCount, subtotal, isCartOpen, setIsCartOpen
    }}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}