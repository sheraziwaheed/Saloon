import Link from "next/link";
import { currentUser } from "@/lib/access";
import { db } from "@/lib/db";
import { signOut } from "@/auth";
import {
  LoginForm,
  ProfileForm,
  WishlistPanel,
} from "@/components/sections/account";
import { PageIntro } from "@/components/sections/shared";
import { money } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await currentUser();
  if (!user)
    return (
      <>
        <PageIntro
          eyebrow="THE LUXE CIRCLE"
          title="A little space for you."
          description="Your appointments, your favourites, and a little something to look forward to."
        />
        <LoginForm google={!!process.env.AUTH_GOOGLE_ID} />
      </>
    );
  const [bookings, orders, points] = await Promise.all([
    db.booking.findMany({
      where: { client: { email: user.email } },
      include: {
        branch: true,
        staff: true,
        items: { include: { service: true } },
      },
      orderBy: { start: "desc" },
    }),
    db.order.findMany({
      where: { email: user.email },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.loyaltyTransaction.aggregate({
      where: { email: user.email },
      _sum: { points: true },
    }),
  ]);
  return (
    <>
      <PageIntro
        eyebrow="YOUR LUXE CIRCLE"
        title={`Hello, ${user.name?.split(" ")[0] || "lovely"}.`}
        description="A little space to keep your appointments, favourites and rewards together."
      />
      <div className="page-content">
        <div className="flex justify-between mb-8">
          {user.role !== "CLIENT" && (
            <Link className="btn btn-outline" href="/admin">
              Salon dashboard →
            </Link>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/account" });
            }}
          >
            <button className="text-link">Sign out</button>
          </form>
        </div>
        <div className="account-grid">
          <div className="panel">
            <h2>Your salon moments.</h2>
            {bookings.length ? (
              bookings.map((b) => (
                <div className="py-4 border-b border-[#deded3]" key={b.id}>
                  <span className="status-pill">{b.status}</span>
                  <h3 className="text-2xl mt-2">
                    {b.items.map((i) => i.service.name).join(", ")}
                  </h3>
                  <p className="text-base my-2">
                    {b.start.toLocaleString("en-GB", {
                      timeZone: "Europe/London",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    <br />
                    {b.staff.name} · {b.branch.name} · {money(b.total)}
                  </p>
                  <Link
                    className="text-link"
                    href={`/booking/manage/${b.token}`}
                  >
                    View or manage →
                  </Link>
                </div>
              ))
            ) : (
              <>
                <p>Your first little escape is waiting.</p>
                <Link className="btn btn-dark mt-5" href="/booking">
                  Book your moment →
                </Link>
              </>
            )}
          </div>
          <div className="panel">
            <small>THE LUXE CIRCLE</small>
            <h2 className="mt-3">
              {points._sum.points || 0} little thank-yous.
            </h2>
            <p>
              Earn one point per £1 on completed salon services. Collect 500
              points for a £5 credit, arranged with our team.
            </p>
            <Link href="/rewards" className="text-link mt-4">
              Explore your rewards →
            </Link>
          </div>
          <div className="panel">
            <h2>Your orders.</h2>
            {orders.length ? (
              orders.map((o) => (
                <div key={o.id} className="py-4 border-b border-[#deded3]">
                  <span className="status-pill">{o.status}</span>
                  <p>
                    {o.items
                      .map((i) => `${i.quantity} × ${i.product.name}`)
                      .join(", ")}
                  </p>
                  <b className="text-base">{money(o.total)}</b>
                </div>
              ))
            ) : (
              <p>A few everyday luxuries, whenever you’re ready.</p>
            )}
          </div>
          <WishlistPanel />
          <ProfileForm name={user.name || ""} email={user.email} />
        </div>
      </div>
    </>
  );
}
