import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { UserMenu } from "@/components/user-menu";
import { getAuthSession } from "@/lib/auth";
import { findUserByEmail } from "@/lib/users";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const dbUser = findUserByEmail(session.user.email);
  const role = (dbUser?.role as string) ?? "freelancer";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 pb-24 md:flex-row md:items-start md:gap-6 md:p-6">
      <div className="hidden space-y-4 md:block">
        <AppSidebar role={role} />
        <UserMenu />
      </div>
      <main className="min-w-0 flex-1 rounded-2xl border border-border bg-background p-4 md:p-6">
        {children}
      </main>
      <MobileBottomNav role={role} />
    </div>
  );
}
