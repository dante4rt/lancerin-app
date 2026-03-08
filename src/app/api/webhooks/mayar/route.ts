import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollectionAsync } from "@/lib/db";
import type { Match } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const invoiceId = payload?.data?.id ?? payload?.data?.transactionId;
    const matchId = payload?.data?.extraData?.noCustomer ?? payload?.data?.extraData?.matchId;

    if (invoiceId || matchId) {
      const matches = readCollection<Match>("matches");
      const index = matches.findIndex(
        (m) => m.id === matchId || m.mayar_invoice_id === invoiceId,
      );

      if (index >= 0) {
        matches[index] = {
          ...matches[index],
          paid_at: new Date().toISOString(),
          status: "in_progress",
        };
        await writeCollectionAsync("matches", matches);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}
