import { PageIntro } from "@/components/sections/shared";
import { Cart } from "@/components/sections/cart";
export const metadata = { title: "Your shopping bag" };
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="A FEW EVERYDAY LUXURIES"
        title="Your little bag of Luxe."
        description="Thoughtful essentials. Chosen by you, with a little help from us."
      />
      <div className="page-content">
        <Cart />
      </div>
    </>
  );
}
