import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";

// Singleton promise for Stripe client loader
let stripePromise = null;
const getStripe = async (key) => {
  if (!stripePromise && key && !key.startsWith("pk_test_mock")) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

function PaymentFormInner({ totalFormatted, onOrderPlace, submitting, error, setError, isMock }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || processing) return;

    // If Stripe is running in mock simulation (no live keys configured in Vercel), save directly
    if (isMock || !stripe || !elements) {
      setProcessing(true);
      await onOrderPlace(true);
      setProcessing(false);
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Trigger validation on Elements
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Please check your payment details.");
        setProcessing(false);
        return;
      }

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/checkout?stripe_redirect=true",
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed to authorize.");
        setProcessing(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        // Payment verified! Create paid order in DB and redirect
        await onOrderPlace(true);
      } else {
        await onOrderPlace(true);
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      setError(err.message || "An unexpected error occurred during payment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={14} className="text-[#C4311E]" />
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#E6E2D3] uppercase">
          {isMock ? "Simulated Payment Portal (Add Stripe keys in Vercel settings for Live Card & Apple Pay)" : "Encrypted Stripe Payment (Cards, Apple Pay & Google Pay)"}
        </p>
      </div>

      {!isMock ? (
        <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      ) : (
        <div className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] space-y-4">
          <div className="p-3 bg-[#C4311E]/10 border border-[#C4311E]/30 text-[#E6E2D3] font-mono text-xs leading-relaxed">
            Stripe API keys not detected on Vercel yet. You can complete orders right now in Test Simulation Mode without charging a real card.
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.3em] text-[#6B6B6B] uppercase mb-2 block">Card Number (Simulated)</label>
            <input
              type="text"
              readOnly
              value="4242 •••• •••• 4242 (Stripe Test Simulation)"
              className="w-full bg-[#0F0F0F] border border-[#1a1a1a] text-[#E6E2D3] px-4 py-3 font-mono text-sm focus:outline-none"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#C4311E]/20 border border-[#C4311E] text-[#E6E2D3] font-mono text-xs">
          {error}
        </div>
      )}

      <div className="flex gap-4 pt-4 items-center">
        <button
          type="submit"
          disabled={submitting || processing || (!isMock && !stripe)}
          className="bg-[#C4311E] hover:bg-[#a02818] disabled:bg-[#333] disabled:cursor-not-allowed text-[#E6E2D3] px-12 py-4 font-heading font-bold text-sm tracking-[0.3em] uppercase transition-colors ml-auto flex items-center gap-3"
        >
          {submitting || processing ? (
            <span className="w-4 h-4 border-2 border-[#E6E2D3] border-t-transparent rounded-full animate-spin" />
          ) : (
            `Place Order — ${totalFormatted}`
          )}
        </button>
      </div>
    </form>
  );
}

export default function StripePaymentSection({
  amount,
  currency,
  orderNumber,
  customerEmail,
  customerName,
  totalFormatted,
  onOrderPlace,
  submitting,
  error,
  setError,
  onBack,
}) {
  const [clientSecret, setClientSecret] = useState(null);
  const [publishableKey, setPublishableKey] = useState(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    let active = true;
    async function initPayment() {
      setLoadingIntent(true);
      try {
        // Fetch config if publishable key missing
        let key = publishableKey;
        if (!key) {
          try {
            const configRes = await fetch("/api/stripe-config");
            if (configRes.ok) {
              const configData = await configRes.json();
              key = configData.publishableKey || "";
              setPublishableKey(key);
            }
          } catch (e) {}
        }

        // Request client secret from our backend serverless endpoint
        const intentRes = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            currency: currency || "cad",
            orderNumber,
            customerEmail,
            customerName,
          }),
        });

        if (intentRes.ok && active) {
          const intentData = await intentRes.json();
          if (intentData.mock || intentData.clientSecret?.startsWith("pi_mock") || !key) {
            setIsMock(true);
            setClientSecret(intentData.clientSecret || "mock");
          } else {
            setIsMock(false);
            setClientSecret(intentData.clientSecret);
            await getStripe(key);
          }
        } else if (active) {
          setIsMock(true);
          setClientSecret("mock_fallback");
        }
      } catch (err) {
        if (active) {
          console.warn("Could not reach Stripe serverless endpoint, using mock mode:", err);
          setIsMock(true);
          setClientSecret("mock_fallback");
        }
      } finally {
        if (active) setLoadingIntent(false);
      }
    }

    initPayment();
    return () => {
      active = false;
    };
  }, [amount, currency, orderNumber, customerEmail, customerName]);

  if (loadingIntent) {
    return (
      <div className="p-12 border border-[#1a1a1a] bg-[#0a0a0a] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#C4311E] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B6B] uppercase">Initializing Secure Stripe Checkout...</p>
      </div>
    );
  }

  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#C4311E",
      colorBackground: "#0a0a0a",
      colorText: "#E6E2D3",
      colorDanger: "#C4311E",
      fontFamily: "monospace",
      borderRadius: "0px",
      borderColor: "#1a1a1a",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-xs tracking-[0.3em] text-[#6B6B6B] hover:text-[#E6E2D3] uppercase transition-colors"
        >
          ← Back to Charity
        </button>
      </div>

      {!isMock && clientSecret && publishableKey ? (
        <Elements
          stripe={getStripe(publishableKey)}
          options={{ clientSecret, appearance }}
        >
          <PaymentFormInner
            totalFormatted={totalFormatted}
            onOrderPlace={onOrderPlace}
            submitting={submitting}
            error={error}
            setError={setError}
            isMock={false}
          />
        </Elements>
      ) : (
        <PaymentFormInner
          totalFormatted={totalFormatted}
          onOrderPlace={onOrderPlace}
          submitting={submitting}
          error={error}
          setError={setError}
          isMock={true}
        />
      )}
    </div>
  );
}
