import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/api-auth";
import { readCollection } from "@/lib/db";
import { getTransactions } from "@/lib/mayar";
import type { Gig, Match, Swipe } from "@/types";

export async function GET() {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const matches = readCollection<Match>("matches").filter(
    (m) => m.client_id === user.id || m.freelancer_id === user.id,
  );

  let transactions: unknown[] = [];
  try {
    const tx = await getTransactions();
    transactions = tx.data ?? [];
  } catch {
    transactions = [];
  }

  const allGigs = readCollection<Gig>("gigs");
  const pending = matches.filter((m) => !m.paid_at).length;
  const completed = matches.filter((m) => m.status === "completed").length;
  const active = matches.filter((m) => m.status !== "completed" && m.paid_at).length;

  // Sum agreed_amount of completed matches as earnings
  const totalEarnings = matches
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => {
      const gig = allGigs.find((g) => g.id === m.gig_id);
      return sum + (m.agreed_amount ?? gig?.budget_max ?? 0);
    }, 0);

  const gigs = allGigs.filter((g) => g.client_id === user.id);
  const swipes = readCollection<Swipe>("swipes");
  const myGigs = gigs.map((g) => ({
    id: g.id,
    title: g.title,
    status: g.status,
    interested_count: swipes.filter((s) => s.gig_id === g.id && s.direction === "right").length,
  }));

  // Build local activity from matches (always available, unlike Mayar API)
  const activity = matches.map((m) => {
    const gig = allGigs.find((g) => g.id === m.gig_id);
    return {
      id: m.id,
      gig_title: gig?.title ?? "Unknown Gig",
      amount: m.agreed_amount ?? gig?.budget_max ?? 0,
      status: m.status,
      paid: !!m.paid_at,
      date: m.paid_at ?? m.created_at,
    };
  });

  return NextResponse.json({
    role: user.role,
    stats: {
      total_earnings: totalEarnings,
      pending_payments: pending,
      completed_gigs: completed,
      active_matches: active,
    },
    transactions,
    activity,
    matches,
    myGigs,
  });
}
