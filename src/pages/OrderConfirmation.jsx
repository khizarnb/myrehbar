import React from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

export default function OrderConfirmation() {
  const location = useLocation();
  const { orderNumber } = useParams();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#C4311E] rounded-full mb-8">
            <Check className="text-[#C4311E]" size={28} />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-black tracking-[0.1em] text-[#E6E2D3] mb-4">ORDER RECEIVED</h1>
          <Link to="/" className="font-mono text-xs tracking-[0.3em] text-[#C4311E] hover:text-[#E6E2D3] uppercase border-b border-[#C4311E] pb-1 transition-colors">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 md:px-12 py-24">
        {/* Success header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-[#C4311E] rounded-full mb-8">
            <Check className="text-[#C4311E]" size={28} />
          </div>
          <p className="font-mono text-[10px] tracking-[0.5em] text-[#C4311E] uppercase mb-4">Order Confirmed</p>
          <h1 className="font-heading text-5xl md:text-6xl font-black tracking-[0.1em] text-[#E6E2D3] leading-none">
            YOU'RE IN
          </h1>
          <p className="font-body text-lg text-[#E6E2D3]/60 mt-6 max-w-md mx-auto leading-relaxed">
            Your piece of the archive is reserved. A confirmation has been sent to {order.customer_email}.
          </p>
        </div>

        {/* Order details */}
        <div className="border border-[#1a1a1a] p-8 md:p-12">
          <div className="flex justify-between items-baseline mb-8 pb-6 border-b border-[#1a1a1a]">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Order Number</p>
              <p className="font-heading text-2xl font-bold text-[#E6E2D3] mt-1">{orderNumber}</p>
            </div>
            <span className="font-mono text-xs tracking-[0.2em] text-[#C4311E] uppercase">{order.status}</span>
          </div>

          {/* Items */}
          <div className="space-y-4 mb-8">
            {order.order_items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <p className="font-heading text-sm font-bold text-[#E6E2D3]">{item.product_title}</p>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] uppercase mt-1">Size {item.size} — Qty {item.quantity}</p>
                </div>
                <p className="font-heading text-sm text-[#E6E2D3]">${item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-3 pt-6 border-t border-[#1a1a1a]">
            <div className="flex justify-between">
              <span className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Subtotal</span>
              <span className="font-body text-sm text-[#E6E2D3]">${order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Shipping</span>
              <span className="font-body text-sm text-[#E6E2D3]">${order.shipping_cost}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Charity Donation</span>
              <span className="font-body text-sm text-[#C4311E]">${order.charity_donation}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#1a1a1a]">
              <span className="font-heading text-base font-bold text-[#E6E2D3]">Total</span>
              <span className="font-heading text-xl font-black text-[#C4311E]">${order.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping + charity info */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="border border-[#1a1a1a] p-6">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-3">Shipping To</p>
            <p className="font-body text-sm text-[#E6E2D3]/80">{order.customer_name}</p>
            <p className="font-body text-sm text-[#E6E2D3]/60">{order.shipping_address}</p>
            <p className="font-body text-sm text-[#E6E2D3]/60">{order.shipping_city}, {order.shipping_country} {order.shipping_zip}</p>
          </div>
          <div className="border border-[#1a1a1a] p-6">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-3">Charity Supported</p>
            <p className="font-body text-sm text-[#E6E2D3]/80">{order.charity}</p>
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#C4311E] mt-1">${order.charity_donation} DONATED</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            to="/#collection"
            className="font-mono text-xs tracking-[0.3em] text-[#C4311E] hover:text-[#E6E2D3] uppercase border-b border-[#C4311E] pb-1 transition-colors"
          >
            Continue Exploring
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}