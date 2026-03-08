"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const allNav = [
  { href: "/", label: "Home", icon: "solar:home-2-outline", roles: ["freelancer", "client"] },
  { href: "/app/swipe", label: "Swipe", icon: "solar:heart-angle-outline", roles: ["freelancer"] },
  { href: "/app/post-gig", label: "Post", icon: "solar:add-circle-outline", roles: ["client"] },
  { href: "/app/matches", label: "Matches", icon: "solar:users-group-rounded-outline", roles: ["freelancer", "client"] },
  { href: "/app/dashboard", label: "Stats", icon: "solar:chart-square-outline", roles: ["freelancer", "client"] },
  { href: "/app/onboarding", label: "Profile", icon: "solar:user-outline", roles: ["freelancer", "client"] },
];

interface MobileBottomNavProps {
  role: string;
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();
  const nav = allNav.filter((item) => item.roles.includes(role));

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="pointer-events-auto mx-auto mb-3 w-[calc(100%-1rem)] max-w-xl rounded-2xl border border-border/90 bg-surface/95 p-2 shadow-lg backdrop-blur-sm">
        <ul className="grid gap-1" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <motion.div whileTap={{ scale: 0.94 }}>
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition-all duration-200 ${
                      active
                        ? "bg-accent text-white shadow-sm"
                        : "text-text-secondary hover:bg-accent-light hover:text-accent-dark"
                    }`}
                  >
                    <Icon icon={item.icon} width="18" height="18" />
                    <span className="leading-none">{item.label}</span>
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
