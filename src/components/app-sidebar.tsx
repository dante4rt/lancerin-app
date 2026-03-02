"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const nav = [
  { href: "/app/swipe", label: "Swipe", icon: "solar:heart-angle-outline" },
  { href: "/app/post-gig", label: "Post Gig", icon: "solar:add-circle-outline" },
  { href: "/app/matches", label: "Matches", icon: "solar:users-group-rounded-outline" },
  { href: "/app/dashboard", label: "Dashboard", icon: "solar:chart-square-outline" },
  { href: "/app/onboarding", label: "Profile", icon: "solar:user-outline" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-2xl border border-zinc-200 bg-white p-4 md:w-64">
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-zinc-500">LANCERIN</p>
      <nav className="space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <Icon icon={item.icon} width="18" height="18" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
