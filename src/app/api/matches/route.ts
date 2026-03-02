import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireCurrentUser } from "@/lib/api-auth";
import { readCollection, writeCollection } from "@/lib/db";
import { createInvoice } from "@/lib/mayar";
import type { Gig, Match, Swipe } from "@/types";

export async function GET() {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const matches = readCollection<Match>("matches").filter(
    (m) => m.client_id === user.id || m.freelancer_id === user.id,
  );
  const gigs = readCollection<Gig>("gigs");

  const result = matches.map((m) => {
    const gig = gigs.find((g) => g.id === m.gig_id);
    return {
      ...m,
      gig_title: gig?.title ?? "Unknown Gig",
      gig_budget: gig?.budget_max ?? 0,
      payment_status: m.paid_at ? "paid" : "pending",
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const body = (await req.json()) as { gig_id?: string; freelancer_id?: string };
  if (!body.gig_id || !body.freelancer_id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const gigs = readCollection<Gig>("gigs");
  const gigIndex = gigs.findIndex((g) => g.id === body.gig_id);
  if (gigIndex === -1) {
    return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  }

  if (gigs[gigIndex].client_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const swipes = readCollection<Swipe>("swipes");
  const rightSwipe = swipes.find(
    (s) => s.gig_id === body.gig_id && s.user_id === body.freelancer_id && s.direction === "right",
  );

  if (!rightSwipe) {
    return NextResponse.json({ error: "Freelancer did not swipe right" }, { status: 400 });
  }

  const matches = readCollection<Match>("matches");
  const duplicate = matches.find(
    (m) => m.gig_id === body.gig_id && m.freelancer_id === body.freelancer_id,
  );

  if (duplicate) {
    return NextResponse.json(duplicate);
  }

  const matchId = uuidv4();
  let mayarInvoiceId: string | null = null;
  let mayarInvoiceUrl: string | null = null;

  try {
    const invoice = await createInvoice({
      name: user.name,
      email: user.email,
      mobile: user.mobile || "081234567890",
      redirectUrl:
        process.env.MAYAR_REDIRECT_URL ?? "http://localhost:3000/app/matches",
      description: `Lancerin Gig Payment: ${gigs[gigIndex].title}`,
      expiredAt: new Date(`${gigs[gigIndex].deadline}T23:59:59.000Z`).toISOString(),
      items: [
        {
          quantity: 1,
          rate: gigs[gigIndex].budget_max,
          description: gigs[gigIndex].title,
        },
      ],
      extraData: {
        matchId,
        gigId: gigs[gigIndex].id,
      },
    });

    mayarInvoiceId = invoice.data.id;
    mayarInvoiceUrl = invoice.data.link;
  } catch {
    mayarInvoiceId = `mock-${matchId}`;
    mayarInvoiceUrl = `https://sandbox.mayar.id/mock-invoice/${matchId}`;
  }

  const match: Match = {
    id: matchId,
    gig_id: gigs[gigIndex].id,
    freelancer_id: body.freelancer_id,
    client_id: user.id,
    status: "pending",
    mayar_invoice_id: mayarInvoiceId,
    mayar_invoice_url: mayarInvoiceUrl,
    paid_at: null,
    created_at: new Date().toISOString(),
  };

  matches.push(match);
  writeCollection("matches", matches);

  gigs[gigIndex] = { ...gigs[gigIndex], status: "matched" };
  writeCollection("gigs", gigs);

  return NextResponse.json(match, { status: 201 });
}
