import Stripe from "stripe";
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key)
    throw new Error(
      "Secure checkout is not configured yet. Please contact the salon to arrange your purchase.",
    );
  if (!key.startsWith("sk_test_") && !key.startsWith("rk_test_"))
    throw new Error("This demonstration accepts Stripe test keys only.");
  return new Stripe(key);
}
