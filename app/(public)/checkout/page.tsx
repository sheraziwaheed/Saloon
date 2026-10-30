import { PageIntro } from "@/components/sections/shared";
import { Cart } from "@/components/sections/cart";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Secure checkout",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cancelled?: string }>;
}) {
  const q = await searchParams;
  return (
    <>
      <PageIntro
        eyebrow="YOUR EVERYDAY, ELEVATED"
        title={
          q.success
            ? "Thank you for a little Luxe."
            : "A little closer to your door."
        }
        description={
          q.success
            ? "Payment status is confirmed securely by Stripe. Sign in with your order email to follow your order."
            : "Your payment is handled securely with Stripe test checkout."
        }
      />
      <div className="page-content">
        {q.success ? (
          <div className="panel">
            <h2>Your order is being checked.</h2>
            <p>
              A return from checkout does not confirm payment. Your account
              order history updates after Stripe sends a verified payment
              notification.
            </p>
          </div>
        ) : (
          <>
            {q.cancelled && (
              <p className="note">
                Checkout was closed. Your bag is still here for you.
              </p>
            )}
            <Cart checkout products={await db.product.findMany()} />
          </>
        )}
      </div>
    </>
  );
}
