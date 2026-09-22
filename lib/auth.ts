import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;

        // Try DB first
        const dbCreds = await db.adminCredentials.findUnique({
          where: { username },
        });

        if (dbCreds) {
          const isValid = await bcrypt.compare(password, dbCreds.passwordHash);
          if (!isValid) return null;
          return { id: "admin", name: username, email: "admin@adventuretradingco.local" };
        }

        // Fall back to env vars (and seed DB on first successful login)
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminUsername || !adminPasswordHash) return null;
        if (username !== adminUsername) return null;

        const isValid = await bcrypt.compare(password, adminPasswordHash);
        if (!isValid) return null;

        await db.adminCredentials.create({
          data: { username, passwordHash: adminPasswordHash },
        });

        return { id: "admin", name: username, email: "admin@adventuretradingco.local" };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
