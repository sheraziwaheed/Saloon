import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const verification =
    token && /^[a-f0-9]{64}$/.test(token)
      ? await db.verificationToken.findUnique({ where: { token } })
      : null;
  if (!verification || verification.expires < new Date())
    return (
      <div className="empty-state">
        <h1>A little fresh start.</h1>
        <p className="my-5">
          This confirmation link is invalid or expired. Submit your registration
          details again to receive a new link.
        </p>
        <Link href="/account" className="btn btn-dark">
          Back to your account
        </Link>
      </div>
    );
  return (
    <div className="auth-box panel">
      <h2>Welcome to your little circle.</h2>
      <p className="my-5">
        Confirm ownership of {verification.identifier} to securely access your
        appointments and orders.
      </p>
      <form
        action={async () => {
          "use server";
          await db.$transaction(async (tx) => {
            const v = await tx.verificationToken.findUnique({
              where: { token: token! },
            });
            if (!v || v.expires < new Date())
              throw new Error("This confirmation link has expired.");
            await tx.user.update({
              where: { email: v.identifier },
              data: { emailVerified: new Date() },
            });
            await tx.verificationToken.deleteMany({
              where: { identifier: v.identifier },
            });
          });
          redirect("/account?verified=1");
        }}
      >
        <button className="btn btn-dark">Confirm my email →</button>
      </form>
    </div>
  );
}
