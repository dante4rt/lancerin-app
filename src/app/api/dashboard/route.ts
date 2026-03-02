import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/api-auth";
import { readCollection } from "@/lib/db";
import { getTransactions } from "@/lib/mayar";
import type { Match } from "@/types";

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

  const pending = matches.filter((m) => !m.paid_at).length;
  const completed = matches.filter((m) => m.status === "completed").length;
  const active = matches.filter((m) => m.status !== "completed").length;

  return NextResponse.json({
    stats: {
      total_earnings: 0,
      pending_payments: pending,
      completed_gigs: completed,
      active_matches: active,
    },
    transactions,
    matches,
  });
}
