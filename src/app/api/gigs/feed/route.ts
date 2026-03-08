import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/api-auth";
import { rankGigsForUser } from "@/lib/ai";
import { readCollection } from "@/lib/db";
import type { Gig, RankedGig, Swipe } from "@/types";

export async function GET() {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const gigs = readCollection<Gig>("gigs").filter((g) => g.status === "open");
  const swipes = readCollection<Swipe>("swipes").filter((s) => s.user_id === user.id);
  const swipedIds = new Set(swipes.map((s) => s.gig_id));

  const unseen = gigs.filter((g) => !swipedIds.has(g.id));

  const timeoutFallback = unseen.map((gig, index) => ({
    gig_id: gig.id,
    score: Math.max(50, 90 - index * 3),
    reason: "Relevance order",
  }));

  const ranking = await Promise.race([
    rankGigsForUser(user, unseen, swipes),
    new Promise<typeof timeoutFallback>((resolve) =>
      setTimeout(() => resolve(timeoutFallback), 8_000),
    ),
  ]);

  const rankedMap = new Map(ranking.map((r) => [r.gig_id, r]));
  const ranked: RankedGig[] = unseen
    .map((g) => {
      const meta = rankedMap.get(g.id);
      return {
        ...g,
        ai_score: meta?.score,
        ai_reason: meta?.reason,
      };
    })
    .sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0));

  return NextResponse.json(ranked);
}
