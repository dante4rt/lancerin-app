import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/api-auth";
import { readCollection } from "@/lib/db";
import type { Gig, Swipe, User } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const { id } = await params;
  const gigs = readCollection<Gig>("gigs");
  const gig = gigs.find((g) => g.id === id);
  if (!gig) {
    return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  }

  if (gig.client_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const swipes = readCollection<Swipe>("swipes").filter(
    (s) => s.gig_id === id && s.direction === "right",
  );
  const users = readCollection<User>("users");
  const freelancers = swipes
    .map((s) => users.find((u) => u.id === s.user_id))
    .filter((u): u is User => Boolean(u));

  return NextResponse.json({ gig, freelancers });
}
