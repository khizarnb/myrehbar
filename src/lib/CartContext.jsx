import React, { createContext, useContext, useState, useEffect } from "react";
import CartDrawer from "@/components/CartDrawer";
import { db } from "@/api/rehbarClient";

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
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem("rehbar_applied_coupon");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("rehbar_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) localStorage.setItem("rehbar_applied_coupon", JSON.stringify(appliedCoupon));
    else localStorage.removeItem("rehbar_applied_coupon");
  }, [appliedCoupon]);

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

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * Number(appliedCoupon.discount_value || 0)) / 100;
    } else {
      discountAmount = Number(appliedCoupon.discount_value || 0);
    }
    if (discountAmount > subtotal) discountAmount = subtotal;
  }

  const applyCouponCode = async (codeStr) => {
    if (!codeStr || !codeStr.trim()) return { success: false, error: "Please enter a coupon code." };
    const cleanCode = codeStr.trim().toUpperCase();
    try {
      const coupons = await db.entities.Coupon.list();
      const coupon = coupons.find(c => (c.code || "").toUpperCase() === cleanCode);
      if (!coupon) return { success: false, error: "Invalid coupon code." };
      if (coupon.active === false) return { success: false, error: "This coupon is currently inactive or expired." };
      if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount)) {
        return { success: false, error: `Minimum order of $${coupon.min_order_amount} required for this coupon.` };
      }
      if (coupon.max_uses && Number(coupon.used_count || 0) >= Number(coupon.max_uses)) {
        return { success: false, error: "This coupon has reached its maximum usage limit." };
      }
      setAppliedCoupon(coupon);
      return { success: true, coupon };
    } catch (e) {
      return { success: false, error: "Failed to validate coupon." };
    }
  };

  const removeCoupon = () => setAppliedCoupon(null);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      cartCount, subtotal, isCartOpen, setIsCartOpen,
      appliedCoupon, discountAmount, applyCouponCode, removeCoupon
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