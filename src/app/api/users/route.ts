import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/api-auth";
import { listUsers, saveUsersAsync, upsertUserFromSession } from "@/lib/users";
import { createCustomer } from "@/lib/mayar";

export async function GET() {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  return NextResponse.json(user);
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireCurrentUser();
  if (response || !user) {
    return response;
  }

  const body = (await req.json()) as {
    name?: string;
    role?: "freelancer" | "client";
    skills?: string[];
    hourly_rate_min?: number;
    hourly_rate_max?: number;
    bio?: string;
    portfolio_url?: string;
    mobile?: string;
  };

  const users = listUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx === -1) {
    const created = upsertUserFromSession(
      { user: { email: user.email, image: user.avatar_url, name: user.name }, expires: new Date(Date.now() + 3600_000).toISOString() },
      body.role ?? user.role,
    );
    return NextResponse.json(created, { status: 201 });
  }

  users[idx] = {
    ...users[idx],
    name: body.name ?? users[idx].name,
    role: body.role ?? users[idx].role,
    skills: body.skills ?? users[idx].skills,
    hourly_rate_min: body.hourly_rate_min ?? users[idx].hourly_rate_min,
    hourly_rate_max: body.hourly_rate_max ?? users[idx].hourly_rate_max,
    bio: body.bio ?? users[idx].bio,
    portfolio_url: body.portfolio_url ?? users[idx].portfolio_url,
    mobile: body.mobile ?? users[idx].mobile,
    onboarded: true,
  };

  if (!users[idx].mayar_customer_id && users[idx].mobile) {
    try {
      const mayarCustomer = await createCustomer({
        name: users[idx].name,
        email: users[idx].email,
        mobile: users[idx].mobile,
      });
      users[idx].mayar_customer_id = mayarCustomer.data.customerId;
    } catch {
      // Allow onboarding to continue in local/dev even if Mayar is unavailable.
    }
  }

  await saveUsersAsync(users);
  return NextResponse.json(users[idx]);
}
