import { PageIntro } from "@/components/sections/shared";
import { Cart } from "@/components/sections/cart";
export const metadata = {
  title: "Product request",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="YOUR EVERYDAY, ELEVATED"
        title="A little Luxe, on request."
        description="Send your selections to our team. We will confirm availability, pricing and collection or delivery arrangements."
      />
      <div className="page-content">
        <Cart checkout />
      </div>
    </>
  );
}
