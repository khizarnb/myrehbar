export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const publishableKey = (process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || "").trim();
  return res.status(200).json({ publishableKey });
}
