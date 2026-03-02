import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";
import { getAuthSession } from "@/lib/auth";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
      <div className="space-y-4">
        <AppSidebar />
        <UserMenu />
      </div>
      <main className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
