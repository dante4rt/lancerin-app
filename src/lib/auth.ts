import type { NextAuthOptions } from "next-auth";
import GoogleProviderImport from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import { cookies, headers } from "next/headers";
import { upsertUserFromSession, findUserByEmail } from "@/lib/users";

type GoogleProviderFactory = (options: {
  clientId: string;
  clientSecret: string;
}) => unknown;

function resolveGoogleProviderFactory(mod: unknown): GoogleProviderFactory | null {
  if (typeof mod === "function") {
    return mod as GoogleProviderFactory;
  }

  const firstDefault = (mod as { default?: unknown } | undefined)?.default;
  if (typeof firstDefault === "function") {
    return firstDefault as GoogleProviderFactory;
  }

  const secondDefault = (
    firstDefault as { default?: unknown } | undefined
  )?.default;
  if (typeof secondDefault === "function") {
    return secondDefault as GoogleProviderFactory;
  }

  return null;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const googleProviderFactory = resolveGoogleProviderFactory(GoogleProviderImport);

const providers: NonNullable<NextAuthOptions["providers"]> =
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && googleProviderFactory
    ? [
        googleProviderFactory({
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
        }) as NonNullable<NextAuthOptions["providers"]>[number],
      ]
    : [];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  jwt: {
    // Vinext + next-auth CJS interop currently breaks @panva/hkdf default import
    // used by next-auth's built-in encrypted JWT path. Use a deterministic
    // base64url payload for this hackathon build to keep auth flow working.
    async encode({ token }) {
      const payload = token ?? {};
      return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
    },
    async decode({ token }) {
      if (!token) {
        return null;
      }

      try {
        const raw = Buffer.from(token, "base64url").toString("utf8");
        return JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return null;
      }
    },
  },
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
          session.user.name = dbUser.name;
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
      upsertUserFromSession({
        user,
        expires: new Date(Date.now() + 3600_000).toISOString(),
      });
    },
  },
};

const CALLBACK_URL_COOKIE_SUFFIX = "next-auth.callback-url";

function decodeCookieValue(value: string): string {
  let decoded = value;

  // Some runtimes expose cookie values still URI-encoded.
  for (let index = 0; index < 3; index += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        break;
      }
      decoded = next;
    } catch {
      break;
    }
  }

  return decoded;
}

export async function getAuthSession() {
  const requestHeaders = Object.fromEntries((await headers()).entries());
  const cookieStore = await cookies();
  const requestCookies = Object.fromEntries(
    cookieStore.getAll().map((cookie) => {
      const value = cookie.name.endsWith(CALLBACK_URL_COOKIE_SUFFIX)
        ? decodeCookieValue(cookie.value)
        : cookie.value;
      return [cookie.name, value];
    }),
  );

  const req = {
    headers: requestHeaders,
    cookies: requestCookies,
  };

  const res = {
    getHeader() {
      return undefined;
    },
    setHeader() {},
    setCookie() {},
  };

  return getServerSession(req as never, res as never, authOptions);
}
