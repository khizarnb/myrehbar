import Stripe from "stripe";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, currency = "cad", orderNumber, customerEmail, customerName } = req.body || {};

    // Check and clean secret key from environment variables (remove leading/trailing spaces or newlines)
    const secretKey = (process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY || "").trim();

    if (!secretKey || secretKey === "sk_test_mock" || secretKey.startsWith("pk_")) {
      console.warn("Valid Stripe Secret Key (sk_...) not found in environment variables. Running in mock simulation mode.");
      return res.status(200).json({
        clientSecret: "pi_mock_secret_test_key_not_configured",
        mock: true,
        message: "Stripe Secret Key not configured in environment. Running in simulation mode."
      });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount provided." });
    }
    const amountInCents = Math.round(numericAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_number: orderNumber || "",
        customer_email: customerEmail || "",
        customer_name: customerName || "",
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      mock: false,
    });
  } catch (error) {
    console.error("Stripe create-payment-intent error:", error);
    // If Stripe fails (e.g. invalid key or currency error), return a clear mock state or error JSON
    return res.status(200).json({
      clientSecret: "pi_mock_secret_fallback_on_error",
      mock: true,
      error: error.message || "Failed to create payment intent."
    });
  }
}
