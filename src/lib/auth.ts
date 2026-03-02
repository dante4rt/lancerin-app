import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import { upsertUserFromSession, findUserByEmail } from "@/lib/users";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const providers =
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = findUserByEmail(session.user.email);
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.onboarded = dbUser.onboarded;
        }
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.email) {
        return;
      }
      upsertUserFromSession({ user, expires: new Date(Date.now() + 3600_000).toISOString() });
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
