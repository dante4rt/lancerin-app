import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireCurrentUser } from "@/lib/api-auth";
import { readCollection, writeCollectionAsync } from "@/lib/db";
import { createInvoice, getInvoiceDetail } from "@/lib/mayar";
import type { Gig, Match, Swipe } from "@/types";

export async function GET() {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const allMatches = readCollection<Match>("matches");
  const userMatches = allMatches.filter(
    (m) => m.client_id === user.id || m.freelancer_id === user.id,
  );

  // Sync unpaid matches with Mayar invoice status (replaces webhook on localhost)
  let dirty = false;
  for (const m of userMatches) {
    if (m.paid_at || !m.mayar_invoice_id || m.mayar_invoice_id.startsWith("mock-")) continue;
    try {
      const detail = await getInvoiceDetail(m.mayar_invoice_id);
      if (detail.status === "paid") {
        const idx = allMatches.findIndex((am) => am.id === m.id);
        if (idx >= 0) {
          allMatches[idx] = { ...allMatches[idx], paid_at: new Date().toISOString(), status: "in_progress" };
          m.paid_at = allMatches[idx].paid_at;
          m.status = "in_progress";
          dirty = true;
        }
      }
    } catch {
      // Mayar unavailable — skip sync
    }
  }
  if (dirty) await writeCollectionAsync("matches", allMatches);

  const gigs = readCollection<Gig>("gigs");

  const result = userMatches.map((m) => {
    const gig = gigs.find((g) => g.id === m.gig_id);
    const isClient = m.client_id === user.id;
    return {
      ...m,
      gig_title: gig?.title ?? "Unknown Gig",
      gig_budget: m.agreed_amount ?? gig?.budget_max ?? 0,
      payment_status: m.paid_at ? "paid" : "pending",
      viewer_role: isClient ? "client" : "freelancer",
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const body = (await req.json()) as { gig_id?: string; freelancer_id?: string; amount?: number };
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

  const gig = gigs[gigIndex];
  const agreedAmount = body.amount ?? gig.budget_max;
  if (agreedAmount < gig.budget_min || agreedAmount > gig.budget_max) {
    return NextResponse.json(
      { error: `Amount must be between ${gig.budget_min} and ${gig.budget_max}` },
      { status: 400 },
    );
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
      description: `Lancerin Gig Payment: ${gig.title}`,
      expiredAt: new Date(`${gig.deadline}T23:59:59.000Z`).toISOString(),
      items: [
        {
          quantity: 1,
          rate: agreedAmount,
          description: gig.title,
        },
      ],
      extraData: {
        noCustomer: matchId,
        idProd: gig.id,
      },
    });

    mayarInvoiceId = invoice.data.id;
    mayarInvoiceUrl = invoice.data.link;
  } catch (err) {
    console.error("[Mayar] Invoice creation failed:", err);
    mayarInvoiceId = `mock-${matchId}`;
    mayarInvoiceUrl = null;
  }

  const match: Match = {
    id: matchId,
    gig_id: gig.id,
    freelancer_id: body.freelancer_id,
    client_id: user.id,
    agreed_amount: agreedAmount,
    status: "pending",
    mayar_invoice_id: mayarInvoiceId,
    mayar_invoice_url: mayarInvoiceUrl,
    paid_at: null,
    created_at: new Date().toISOString(),
  };

  matches.push(match);
  gigs[gigIndex] = { ...gig, status: "matched" };

  // Await KV writes so other isolates see the new match immediately
  await Promise.all([
    writeCollectionAsync("matches", matches),
    writeCollectionAsync("gigs", gigs),
  ]);

  return NextResponse.json(match, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const body = (await req.json()) as { match_id?: string; action?: string };
  if (!body.match_id || !body.action) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const matches = readCollection<Match>("matches");
  const idx = matches.findIndex((m) => m.id === body.match_id);
  if (idx === -1) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const match = matches[idx];
  const isClient = match.client_id === user.id;
  const isFreelancer = match.freelancer_id === user.id;

  if (!isClient && !isFreelancer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Freelancer marks work as delivered
  if (body.action === "deliver" && isFreelancer && match.status === "in_progress") {
    matches[idx] = { ...match, status: "delivered" };
    await writeCollectionAsync("matches", matches);
    return NextResponse.json(matches[idx]);
  }

  // Client confirms delivery → completed
  if (body.action === "complete" && isClient && match.status === "delivered") {
    matches[idx] = { ...match, status: "completed" };
    await writeCollectionAsync("matches", matches);
    return NextResponse.json(matches[idx]);
  }

  return NextResponse.json({ error: "Invalid action for current status" }, { status: 400 });
}
