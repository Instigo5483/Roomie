import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "credentials",
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user?.password_hash) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.full_name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        token.iat = Math.floor(Date.now() / 1000);
      }

      // "Sign out of all devices" works by stamping sessions_invalidated_at on
      // the user row — any JWT issued before that moment is treated as dead.
      if (token.userId) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.userId as string),
          columns: { sessions_invalidated_at: true },
        });
        const invalidatedAt = dbUser?.sessions_invalidated_at
          ? Math.floor(new Date(dbUser.sessions_invalidated_at).getTime() / 1000)
          : null;
        const issuedAt = typeof token.iat === "number" ? token.iat : 0;

        if (invalidatedAt !== null && issuedAt < invalidatedAt) {
          delete token.userId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.userId) {
        return { ...session, user: undefined as unknown as typeof session.user };
      }
      if (session.user) session.user.id = token.userId as string;
      return session;
    },
  },
});
