import { PageIntro } from "@/components/sections/shared";
import { Cart } from "@/components/sections/cart";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your shopping bag" };
export default async function Page() {
  return (
    <>
      <PageIntro
        eyebrow="A FEW EVERYDAY LUXURIES"
        title="Your little bag of Luxe."
        description="Thoughtful essentials. Chosen by you, with a little help from us."
      />
      <div className="page-content">
        <Cart products={await db.product.findMany()} />
      </div>
    </>
  );
}
