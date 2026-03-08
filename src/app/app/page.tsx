import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findUserByEmail } from "@/lib/users";

export default async function AppIndexPage() {
  const session = await getAuthSession();
  const dbUser = session?.user?.email ? findUserByEmail(session.user.email) : null;
  const role = dbUser?.role ?? "freelancer";

  redirect(role === "client" ? "/app/dashboard" : "/app/swipe");
}
