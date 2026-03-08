import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireCurrentUser } from "@/lib/api-auth";
import { readCollection, writeCollectionAsync } from "@/lib/db";
import type { Gig } from "@/types";

export async function GET(req: NextRequest) {
  const gigs = readCollection<Gig>("gigs");
  const clientId = req.nextUrl.searchParams.get("client_id");
  if (clientId) {
    return NextResponse.json(gigs.filter((g) => g.client_id === clientId));
  }

  return NextResponse.json(gigs.filter((g) => g.status === "open"));
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const body = (await req.json()) as {
    title?: string;
    description?: string;
    budget_min?: number;
    budget_max?: number;
    required_skills?: string[];
    deadline?: string;
  };

  if (!body.title || !body.description || !body.deadline) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  if (body.deadline < today) {
    return NextResponse.json(
      { error: "Deadline cannot be in the past" },
      { status: 400 },
    );
  }

  const gigs = readCollection<Gig>("gigs");
  const gig: Gig = {
    id: uuidv4(),
    client_id: user.id,
    client_name: user.name,
    title: body.title,
    description: body.description,
    budget_min: Number(body.budget_min ?? 0),
    budget_max: Number(body.budget_max ?? 0),
    required_skills: body.required_skills ?? [],
    deadline: body.deadline,
    status: "open",
    created_at: new Date().toISOString(),
  };

  gigs.push(gig);
  await writeCollectionAsync("gigs", gigs);
  return NextResponse.json(gig, { status: 201 });
}
