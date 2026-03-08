"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const allNav = [
  { href: "/", label: "Home", icon: "solar:home-2-outline", roles: ["freelancer", "client"] },
  { href: "/app/swipe", label: "Swipe", icon: "solar:heart-angle-outline", roles: ["freelancer"] },
  { href: "/app/post-gig", label: "Post Gig", icon: "solar:add-circle-outline", roles: ["client"] },
  { href: "/app/matches", label: "Matches", icon: "solar:users-group-rounded-outline", roles: ["freelancer", "client"] },
  { href: "/app/dashboard", label: "Dashboard", icon: "solar:chart-square-outline", roles: ["freelancer", "client"] },
  { href: "/app/onboarding", label: "Profile", icon: "solar:user-outline", roles: ["freelancer", "client"] },
];

interface AppSidebarProps {
  role: string;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const nav = allNav.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 rounded-2xl border border-border bg-surface p-4">
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-accent">LANCERIN</p>
      <nav className="space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-zinc-700 hover:bg-accent-light hover:text-accent-dark"
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
