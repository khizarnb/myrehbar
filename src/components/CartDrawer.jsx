import React from "react";
import { useCart } from "@/lib/CartContext";
import { useCurrency } from "@/lib/CurrencyContext";
import { X, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, subtotal, cartCount } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const goToCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/70" onClick={() => setIsCartOpen(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0F0F0F] border-l border-[#1a1a1a] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1a1a]">
          <h2 className="font-heading text-lg font-black tracking-[0.2em] text-[#E6E2D3]">
            THE ARCHIVE
          </h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs tracking-[0.2em] text-[#C4311E]">{cartCount} ITEMS</span>
            <button onClick={() => setIsCartOpen(false)} className="text-[#6B6B6B] hover:text-[#E6E2D3] transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] uppercase text-center">
                Your archive is empty
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 font-mono text-xs tracking-[0.3em] text-[#C4311E] hover:text-[#E6E2D3] uppercase border-b border-[#C4311E] pb-1 transition-colors"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="flex gap-4 border-b border-[#1a1a1a] pb-4">
                  <img src={item.image} alt={item.title} className="w-20 h-24 object-cover" />
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-heading text-sm font-bold tracking-wider text-[#E6E2D3]">{item.title}</h3>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] uppercase mt-1">SIZE {item.size}</p>
                    <p className="font-heading text-sm text-[#C4311E] mt-1">{formatPrice(item.price)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-[#1a1a1a]">
                        <button
                          onClick={() => updateQuantity(item.slug, item.size, item.quantity - 1)}
                          className="px-2 py-1.5 text-[#E6E2D3] hover:text-[#C4311E] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-mono text-xs text-[#E6E2D3] w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.slug, item.size, item.quantity + 1)}
                          className="px-2 py-1.5 text-[#E6E2D3] hover:text-[#C4311E] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug, item.size)}
                        className="font-mono text-[10px] tracking-wider text-[#6B6B6B] hover:text-[#C4311E] uppercase transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#1a1a1a] px-6 py-5">
            <div className="flex justify-between mb-3">
              <span className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Subtotal</span>
              <span className="font-heading text-lg font-bold text-[#E6E2D3]">{formatPrice(subtotal)}</span>
            </div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] mb-4">
              A portion from each item goes to your chosen charity. Shipping calculated at checkout.
            </p>
            <button
              onClick={goToCheckout}
              className="w-full bg-[#C4311E] hover:bg-[#a02818] text-[#E6E2D3] py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}