import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/api-auth";

export async function GET() {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  return NextResponse.json(user);
}
