import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { findUserByEmail, upsertUserFromSession } from "@/lib/users";
import type { User } from "@/types";

export async function requireCurrentUser(): Promise<{ user: User | null; response?: NextResponse }> {
  const session = await getAuthSession();
  const email = session?.user?.email;

  if (!session || !email) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  let user = findUserByEmail(email);
  if (!user) {
    user = upsertUserFromSession(session);
  }

  return { user };
}
