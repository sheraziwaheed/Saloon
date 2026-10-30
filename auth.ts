import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/http";
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  secret:
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "luxe-local-development-only-secret-32-characters"
      : undefined),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/account" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        await rateLimit("login", 10);
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(1).max(128),
          })
          .safeParse(raw);
        if (!parsed.success) return null;
        const u = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (
          !u?.password ||
          !u.emailVerified ||
          !(await compare(parsed.data.password, u.password))
        )
          return null;
        return { id: u.id, name: u.name, email: u.email, image: u.image };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        const u = await db.user.findUnique({
          where: { email: session.user.email },
        });
        if (u) {
          session.user.id = u.id;
        }
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (
        account?.provider === "google" &&
        user.id &&
        profile?.email_verified === true
      )
        await db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
    },
  },
});
