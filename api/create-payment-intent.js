import Stripe from "stripe";

export default async function handler(req, res) {
  // Set CORS headers just in case
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

    // Check for secret key in environment variables
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;

    if (!secretKey || secretKey === "sk_test_mock" || secretKey.trim() === "") {
      // If Stripe secret key is not configured yet, return a clear mock state so checkout gracefully allows demo / test completion
      console.warn("Stripe Secret Key not found in environment variables. Returning mock client secret.");
      return res.status(200).json({
        clientSecret: "pi_mock_secret_test_key_not_configured",
        mock: true,
        message: "Stripe Secret Key not configured in environment. Running in mock simulation mode."
      });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });

    // Convert amount to smallest currency unit (cents/pence)
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount provided." });
    }
    const amountInCents = Math.round(numericAmount * 100);

    // Create PaymentIntent
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
    return res.status(500).json({
      error: error.message || "Failed to create payment intent.",
    });
  }
}
