import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireCurrentUser } from "@/lib/api-auth";
import { readCollection, writeCollection } from "@/lib/db";
import type { Swipe } from "@/types";

export async function GET() {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const swipes = readCollection<Swipe>("swipes").filter((s) => s.user_id === user.id);
  return NextResponse.json(swipes);
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const body = (await req.json()) as { gig_id?: string; direction?: "left" | "right" };
  if (!body.gig_id || !body.direction) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const swipes = readCollection<Swipe>("swipes");
  const existing = swipes.find((s) => s.user_id === user.id && s.gig_id === body.gig_id);
  if (existing) {
    return NextResponse.json(existing);
  }

  const swipe: Swipe = {
    id: uuidv4(),
    user_id: user.id,
    gig_id: body.gig_id,
    direction: body.direction,
    created_at: new Date().toISOString(),
  };

  swipes.push(swipe);
  writeCollection("swipes", swipes);
  return NextResponse.json(swipe, { status: 201 });
}
