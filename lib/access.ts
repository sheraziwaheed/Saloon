import { auth } from "@/auth";
import { db } from "./db";
export async function currentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  return user?.emailVerified ? user : null;
}
export async function requireAdmin() {
  const u = await currentUser();
  if (!u || !["OWNER", "MANAGER", "STYLIST"].includes(u.role))
    throw new Error("Administrator access required.");
  return u;
}
export async function requireManager() {
  const u = await requireAdmin();
  if (!["OWNER", "MANAGER"].includes(u.role))
    throw new Error("Manager access required.");
  return u;
}
