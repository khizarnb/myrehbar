import { db } from '@/api/rehbarClient';

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/lib/CartContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Lock, ChevronLeft } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY || import.meta.env.VITE_PUBLIC_STRIPE_KEY || '';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const cardElementOptions = {
  style: {
    base: {
      color: '#E6E2D3',
      fontFamily: 'monospace, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#6B6B6B',
      },
      iconColor: '#C4311E',
    },
    invalid: {
      color: '#C4311E',
      iconColor: '#C4311E',
    },
  },
};

function StripeCardForm({ form, total, items, subtotal, shippingCost, charityDonation, clearCart, navigate, setStep }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleStripeSubmit = async () => {
    if (!stripe || !elements) {
      setError("Stripe payment gateway is initializing...");
      return;
    }
    setSubmitting(true);
    setError("");

    const cardEl = elements.getElement(CardElement);
    if (!cardEl) {
      setError("Card input not found.");
      setSubmitting(false);
      return;
    }

    // Attempt backend PaymentIntent first
    let clientSecret = null;
    const orderNumber = "REH-" + Date.now().toString().slice(-6);
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
          customer_email: form.email,
          order_number: orderNumber
        })
      });
      if (res.ok) {
        const data = await res.json();
        clientSecret = data.clientSecret;
      }
    } catch (e) {
      // Backend not reached or not configured
    }

    let paymentMethodIdOrStatus = "";
    if (clientSecret) {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardEl,
          billing_details: {
            name: form.cardName || form.name || "Customer",
            email: form.email,
            phone: form.phone || undefined,
            address: {
              line1: form.address,
              city: form.city,
              country: getCleanCountryCode(form.country) === "ROW" ? "GB" : getCleanCountryCode(form.country),
              postal_code: form.zip
            }
          }
        }
      });
      if (result.error) {
        setError(result.error.message || "Payment verification failed.");
        setSubmitting(false);
        return;
      }
      paymentMethodIdOrStatus = result.paymentIntent?.id || "Stripe_Paid";
    } else {
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardEl,
        billing_details: {
          name: form.cardName || form.name || "Customer",
          email: form.email,
          phone: form.phone || undefined,
          address: {
            line1: form.address,
            city: form.city,
            country: getCleanCountryCode(form.country) === "ROW" ? "GB" : getCleanCountryCode(form.country),
            postal_code: form.zip
          }
        }
      });
      if (pmError) {
        setError(pmError.message || "Invalid card details.");
        setSubmitting(false);
        return;
      }
      paymentMethodIdOrStatus = paymentMethod.id;
    }

    // Save order and complete
    const chosenCharity = form.charity === "Charity of your choice" ? `Custom: ${form.customCharity}` : form.charity;
    const orderData = {
      order_number: orderNumber,
      order_items: items.map(i => ({ product_id: i.slug, product_title: i.title, size: i.size, quantity: i.quantity, price: i.price })),
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone || "",
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_country: form.country,
      shipping_zip: form.zip,
      charity: chosenCharity,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      charity_donation: charityDonation,
      total: total,
      status: "paid (stripe: " + paymentMethodIdOrStatus + ")",
      created_date: new Date().toISOString()
    };

    try {
      await db.entities.Order.create({
        order_number: orderData.order_number,
        items_json: JSON.stringify(orderData.order_items),
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone || "",
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_country: orderData.shipping_country,
        shipping_zip: orderData.shipping_zip,
        charity: orderData.charity,
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shipping_cost,
        charity_donation: orderData.charity_donation,
        total: orderData.total,
        status: "paid (stripe: " + paymentMethodIdOrStatus + ")"
      });

      // Dispatch order notification email to sales@myrehbar.com
      const itemsFormatted = orderData.order_items.map(i => `${i.quantity}x ${i.product_title} (${i.size || 'Regular'}) - $${i.price * i.quantity}`).join(' | ');
      const emailSubject = `🚨 NEW REHBAR ORDER #${orderData.order_number} ($${orderData.total} USD - ${orderData.shipping_country})`;
      const emailBody = `A new order has been placed on REHBAR Store!\n\nOrder #${orderData.order_number}\nTotal Amount: $${orderData.total} USD\nCustomer: ${orderData.customer_name} (${orderData.customer_email})\nPhone: ${orderData.customer_phone || 'N/A'}\n\nShipping Destination:\n${orderData.shipping_address}, ${orderData.shipping_city}, ${orderData.shipping_zip}, ${orderData.shipping_country}\n\nItems:\n${itemsFormatted}\n\nCharity Selected: ${orderData.charity} (Donation: $${orderData.charity_donation})\nPayment Status: Paid (${paymentMethodIdOrStatus})`;

      if (db.integrations?.Core?.SendEmail) {
        await db.integrations.Core.SendEmail({
          to: 'sales@myrehbar.com',
          subject: emailSubject,
          body: emailBody,
          orderData: {
            "Order Number": `#${orderData.order_number}`,
            "Total Paid": `$${orderData.total} USD`,
            "Customer Name": orderData.customer_name,
            "Customer Email": orderData.customer_email,
            "Customer Phone": orderData.customer_phone || 'N/A',
            "Shipping Address": `${orderData.shipping_address}, ${orderData.shipping_city}, ${orderData.shipping_zip}, ${orderData.shipping_country}`,
            "Items Ordered": itemsFormatted,
            "Charity Selection": `${orderData.charity} ($${orderData.charity_donation} donation)`,
            "Payment Status": `Paid (${paymentMethodIdOrStatus})`,
            "Order Time": new Date().toLocaleString()
          }
        });
      }
    } catch (e) {
      console.error('Order creation or email notification error:', e);
    }
    clearCart();
    navigate(`/order-confirmation/${orderNumber}`, { state: { order: orderData } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Lock size={14} className="text-[#C4311E]" />
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#E6E2D3] uppercase font-bold">Stripe Encrypted Payment</p>
      </div>
      <div>
        <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2 block">Card Details</label>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 text-[#E6E2D3] focus-within:border-[#C4311E] transition-colors">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      <div>
        <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2 block">Name on Card</label>
        <input
          type="text"
          defaultValue={form.cardName || form.name}
          placeholder="Name as it appears on card"
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#E6E2D3] px-4 py-3 font-body text-sm placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#C4311E] transition-colors"
        />
      </div>
      {error && <p className="font-mono text-xs tracking-wider text-[#C4311E] bg-[#C4311E]/10 p-3 border border-[#C4311E]/30">{error}</p>}
      <div className="flex gap-4 pt-2 items-center">
        <button onClick={() => setStep(2)} disabled={submitting} className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] hover:text-[#E6E2D3] uppercase transition-colors">← Back</button>
        <button
          onClick={handleStripeSubmit}
          disabled={!stripe || submitting}
          className="bg-[#C4311E] hover:bg-[#a02818] disabled:bg-[#333] disabled:cursor-not-allowed text-[#E6E2D3] px-12 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors ml-auto flex items-center gap-3"
        >
          {submitting ? <span className="w-4 h-4 border-2 border-[#E6E2D3] border-t-transparent rounded-full animate-spin" /> : `Pay $${total} via Stripe`}
        </button>
      </div>
    </div>
  );
}

const CHARITIES = [
  { name: "Islamic Relief", category: "Humanitarian Aid" },
  { name: "Muslim Hands", category: "Education" },
  { name: "Penny Appeal", category: "Food Poverty" },
  { name: "Zakat Foundation", category: "Community Infrastructure" },
  { name: "Human Concern International", category: "Humanitarian Aid" },
  { name: "Charity of your choice", category: "Custom Donation" },
];
const COUNTRY_OPTIONS = [
  { code: "US", name: "United States", cost: 10 },
  { code: "CA", name: "Canada", cost: 10 },
  { code: "GB", name: "United Kingdom", cost: 15 },
  { code: "ROW", name: "Rest of World", cost: 15 },
];
const getShippingCost = (country) => {
  if (country === "GB" || country === "ROW" || country === "United Kingdom" || country === "Rest of World") return 15;
  return 10;
};
const getCleanCountryCode = (country) => {
  if (!country) return "US";
  const upper = country.toString().toUpperCase().trim();
  if (upper.includes("CANADA") || upper === "CA") return "CA";
  if (upper.includes("UNITED STATES") || upper === "USA" || upper === "US") return "US";
  if (upper.includes("UNITED KINGDOM") || upper.includes("GREAT BRITAIN") || upper === "UK" || upper === "GB") return "GB";
  if (upper === "ROW" || upper.includes("WORLD") || upper.includes("REST OF")) return "ROW";
  if (upper.length === 2) return upper;
  return "US";
};
const CHARITY_PER_ITEM = 6;
const STEP_LABELS = ["Shipping", "Charity", "Payment"];

function Field({ label, value, onChange, placeholder, type }) {
  return (
    <div>
      <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2 block">{label}</label>
      <input
        type={type || "text"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#E6E2D3] px-4 py-3 font-body text-sm placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#C4311E] transition-colors"
      />
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCart, cartCount } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [authed, setAuthed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", country: "US", zip: "",
    charity: "", customCharity: "", cardNumber: "", cardName: "", expiry: "", cvc: ""
  });

  useEffect(() => {
    db.auth.isAuthenticated().then(setAuthed);
  }, []);

  useEffect(() => {
    if (authed === true) {
      db.auth.me().then(user => {
        if (user?.full_name) setForm(p => ({ ...p, name: user.full_name }));
        if (user?.email) setForm(p => ({ ...p, email: user.email }));
      }).catch(() => {});
    }
  }, [authed]);

  const set = (field, val) => {
    let sanitizedVal = val;
    if (field === "country") {
      sanitizedVal = getCleanCountryCode(val);
    }
    setForm(p => ({ ...p, [field]: sanitizedVal }));
  };
  const shippingCost = getShippingCost(form.country);
  const total = subtotal + shippingCost;
  const charityDonation = CHARITY_PER_ITEM * cartCount;

  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const canProceedShipping = form.name && form.email && form.phone && form.address && form.city && form.country && form.zip;
  const canProceedCharity = form.charity === "Charity of your choice" ? !!form.customCharity?.trim() : !!form.charity;
  const canPlaceOrder = form.cardNumber.replace(/\s/g, "").length === 16 && form.cardName && form.expiry.length === 5 && form.cvc.length >= 3;

  const placeOrder = async () => {
    if (!canPlaceOrder) { setError("Please complete all payment fields."); return; }
    setSubmitting(true);
    setError("");
    const chosenCharity = form.charity === "Charity of your choice" ? `Custom: ${form.customCharity}` : form.charity;
    const orderNumber = "REH-" + Date.now().toString().slice(-6);
    const orderData = {
      order_number: orderNumber,
      order_items: items.map(i => ({ product_id: i.slug, product_title: i.title, size: i.size, quantity: i.quantity, price: i.price })),
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone || "",
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_country: form.country,
      shipping_zip: form.zip,
      charity: chosenCharity,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      charity_donation: charityDonation,
      total: total,
      status: "pending",
      created_date: new Date().toISOString()
    };
    try {
      await db.entities.Order.create({
        order_number: orderData.order_number,
        items_json: JSON.stringify(orderData.order_items),
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone || "",
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_country: orderData.shipping_country,
        shipping_zip: orderData.shipping_zip,
        charity: orderData.charity,
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shipping_cost,
        charity_donation: orderData.charity_donation,
        total: orderData.total,
        status: "pending"
      });
    } catch (e) { /* order save failed, continue to confirmation */ }
    clearCart();
    navigate(`/order-confirmation/${orderNumber}`, { state: { order: orderData } });
  };

  // Empty cart
  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] uppercase mb-4">Your archive is empty</p>
          <Link to="/#collection" className="font-mono text-xs tracking-[0.3em] text-[#C4311E] hover:text-[#E6E2D3] uppercase border-b border-[#C4311E] pb-1 transition-colors">Explore Collection</Link>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Navbar />

      <div className="pt-20 px-6 md:px-16 py-12 max-w-6xl mx-auto">
        <Link to="/#collection" className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#6B6B6B] hover:text-[#E6E2D3] uppercase mb-8 transition-colors">
          <ChevronLeft size={14} /> Continue Shopping
        </Link>

        <h1 className="font-heading text-4xl md:text-5xl font-black tracking-[0.1em] text-[#E6E2D3] mb-10">CHECKOUT</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 md:gap-6 mb-12 flex-wrap">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 md:gap-6">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 border transition-colors ${step > i + 1 ? "bg-[#C4311E] border-[#C4311E] text-[#E6E2D3]" : step === i + 1 ? "border-[#C4311E] text-[#C4311E]" : "border-[#333] text-[#6B6B6B]"}`}>
                  {step > i + 1 ? <Check size={14} /> : <span className="font-mono text-xs">{i + 1}</span>}
                </div>
                <span className={`font-mono text-[10px] tracking-[0.3em] uppercase hidden md:block ${step >= i + 1 ? "text-[#E6E2D3]" : "text-[#6B6B6B]"}`}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && <div className="w-6 md:w-16 h-px bg-[#1a1a1a]" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-12">
          {/* Left — steps */}
          <div>
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Full Name" value={form.name} onChange={v => set("name", v)} placeholder="Your name" />
                  <Field label="Email" type="email" value={form.email} onChange={v => set("email", v)} placeholder="you@email.com" />
                </div>
                <Field label="Mobile / WhatsApp Number" type="tel" value={form.phone} onChange={v => set("phone", v)} placeholder="+1 (555) 000-0000" />
                <Field label="Address" value={form.address} onChange={v => set("address", v)} placeholder="Street address" />
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="City" value={form.city} onChange={v => set("city", v)} placeholder="City" />
                  <div>
                    <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2 block">Country / Shipping</label>
                    <select
                      value={form.country || "US"}
                      onChange={e => set("country", e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#E6E2D3] p-4 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors"
                    >
                      {COUNTRY_OPTIONS.map(opt => (
                        <option key={opt.code} value={opt.code}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                  <Field label="Postal Code" value={form.zip} onChange={v => set("zip", v)} placeholder="ZIP / Postal" />
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedShipping}
                  className="bg-[#C4311E] hover:bg-[#a02818] disabled:bg-[#333] disabled:cursor-not-allowed text-[#E6E2D3] px-10 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors"
                >
                  Continue to Charity
                </button>
              </div>
            )}

            {/* Step 2: Charity */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="font-body text-sm text-[#E6E2D3]/60 mb-6">
                  <span className="text-[#C4311E] font-bold">${CHARITY_PER_ITEM}</span> from each shirt goes to a verified cause of your choice. Total donation: <span className="text-[#C4311E] font-bold">${charityDonation}</span>
                </p>
                {CHARITIES.map(c => (
                  <button
                    key={c.name}
                    onClick={() => set("charity", c.name)}
                    className={`w-full flex items-center justify-between p-5 border transition-colors text-left ${form.charity === c.name ? "border-[#C4311E]" : "border-[#1a1a1a] hover:border-[#333]"}`}
                  >
                    <div>
                      <p className={`font-heading text-base font-bold tracking-wide transition-colors ${form.charity === c.name ? "text-[#C4311E]" : "text-[#E6E2D3]"}`}>{c.name}</p>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] uppercase mt-1">{c.category}</p>
                    </div>
                    <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${form.charity === c.name ? "bg-[#C4311E] border-[#C4311E]" : "border-[#333]"}`}>
                      {form.charity === c.name && <Check size={12} className="text-[#E6E2D3]" />}
                    </div>
                  </button>
                ))}
                {form.charity === "Charity of your choice" && (
                  <div className="mt-4 pt-2">
                    <label className="font-mono text-[10px] tracking-[0.3em] text-[#C4311E] uppercase block mb-2">Specify Custom Charity Details</label>
                    <textarea
                      rows={3}
                      value={form.customCharity || ""}
                      onChange={e => set("customCharity", e.target.value)}
                      placeholder="please write complete information where you want from us to donate there"
                      className="w-full bg-[#0a0a0a] border border-[#C4311E]/40 text-[#E6E2D3] p-4 font-body text-sm focus:outline-none focus:border-[#C4311E] transition-colors resize-none placeholder:text-[#6B6B6B]"
                    />
                  </div>
                )}
                <div className="flex gap-4 pt-4 items-center">
                  <button onClick={() => setStep(1)} className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] hover:text-[#E6E2D3] uppercase transition-colors">← Back</button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canProceedCharity}
                    className="bg-[#C4311E] hover:bg-[#a02818] disabled:bg-[#333] disabled:cursor-not-allowed text-[#E6E2D3] px-10 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors ml-auto"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div>
                {stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <StripeCardForm
                      form={form}
                      total={total}
                      items={items}
                      subtotal={subtotal}
                      shippingCost={shippingCost}
                      charityDonation={charityDonation}
                      clearCart={clearCart}
                      navigate={navigate}
                      setStep={setStep}
                    />
                  </Elements>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={14} className="text-[#6B6B6B]" />
                      <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase">Secure Payment</p>
                    </div>
                    <div className="bg-[#1a1a1a]/60 border border-[#333] p-4 font-mono text-xs text-[#E6E2D3]/80 leading-relaxed mb-4">
                      <span className="text-[#C4311E] font-bold">Stripe Mode:</span> To activate Stripe card elements directly on this screen, make sure your Vercel Environment Variable is named <code className="text-[#E6E2D3] bg-[#0a0a0a] px-1.5 py-0.5 border border-[#333]">VITE_STRIPE_PUBLISHABLE_KEY</code> and redeploy.
                    </div>
                    <Field label="Card Number" value={form.cardNumber} onChange={v => set("cardNumber", formatCard(v))} placeholder="0000 0000 0000 0000" />
                    <Field label="Name on Card" value={form.cardName} onChange={v => set("cardName", v)} placeholder="Name as it appears on card" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry (MM/YY)" value={form.expiry} onChange={v => set("expiry", formatExpiry(v))} placeholder="MM/YY" />
                      <Field label="CVC" value={form.cvc} onChange={v => set("cvc", v.replace(/\D/g, "").slice(0, 4))} placeholder="123" />
                    </div>
                    {error && <p className="font-mono text-xs tracking-wider text-[#C4311E]">{error}</p>}
                    <div className="flex gap-4 pt-2 items-center">
                      <button onClick={() => setStep(2)} className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] hover:text-[#E6E2D3] uppercase transition-colors">← Back</button>
                      <button
                        onClick={placeOrder}
                        disabled={!canPlaceOrder || submitting}
                        className="bg-[#C4311E] hover:bg-[#a02818] disabled:bg-[#333] disabled:cursor-not-allowed text-[#E6E2D3] px-12 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors ml-auto flex items-center gap-3"
                      >
                        {submitting
                          ? <span className="w-4 h-4 border-2 border-[#E6E2D3] border-t-transparent rounded-full animate-spin" />
                          : `Place Order — $${total}`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — order summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="border border-[#1a1a1a] p-6">
              <p className="font-mono text-[10px] tracking-[0.4em] text-[#6B6B6B] uppercase mb-6">Order Summary</p>
              <div className="space-y-4 mb-6">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={item.image} alt="" className="w-16 h-16 object-cover" />
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="font-heading text-xs font-bold text-[#E6E2D3] tracking-wide">{item.title}</p>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-[#6B6B6B] uppercase mt-1">Size {item.size} — Qty {item.quantity}</p>
                      <p className="font-body text-xs text-[#E6E2D3]/80 mt-1">${item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 border-t border-[#1a1a1a]">
                <div className="flex justify-between">
                  <span className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Subtotal</span>
                  <span className="font-body text-sm text-[#E6E2D3]">${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Shipping</span>
                  <span className="font-body text-sm text-[#E6E2D3]">${shippingCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Charity</span>
                  <span className="font-body text-sm text-[#C4311E]">${charityDonation}</span>
                </div>
                <div className="flex justify-between pt-3 mt-3 border-t border-[#1a1a1a]">
                  <span className="font-heading text-sm font-bold text-[#E6E2D3]">Total</span>
                  <span className="font-heading text-xl font-black text-[#C4311E]">${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}