import Stripe from 'stripe';

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Look for any standard Stripe secret key environment variable
  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY || process.env.STRIPE_API_KEY || process.env.VITE_STRIPE_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ 
      error: 'Stripe Secret Key (STRIPE_SECRET_KEY) is not configured on the Vercel backend. To collect real card payments and deposit funds into your account, open Vercel -> Project Settings -> Environment Variables and add STRIPE_SECRET_KEY containing your Stripe Secret Key (sk_live_... or sk_test_...).' 
    });
  }

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });

    const { amount, amountInCents, currency = 'usd', customer_email, order_number, orderId } = req.body || {};
    
    // Amount in cents (minimum $0.50 USD = 50 cents)
    let finalCents = 50;
    if (amountInCents !== undefined && amountInCents !== null && !isNaN(Number(amountInCents))) {
      finalCents = Math.max(50, Math.round(Number(amountInCents)));
    } else if (amount !== undefined && amount !== null && !isNaN(Number(amount))) {
      finalCents = Math.max(50, Math.round(Number(amount) * 100));
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_number: order_number || orderId || 'REH-CHECKOUT',
        customer_email: customer_email || 'anonymous',
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('Stripe PaymentIntent Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Stripe Error' });
  }
}
