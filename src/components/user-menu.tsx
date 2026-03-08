"use client";

import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data } = useSession();

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <img
        src={`https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(data?.user?.email ?? "guest")}`}
        alt=""
        className="mb-2 h-8 w-8 rounded-full bg-accent-light"
      />
      <p className="text-sm font-semibold text-text-primary">{data?.user?.name ?? "Guest"}</p>
      <p className="text-xs text-text-muted">{data?.user?.email ?? "Not signed in"}</p>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-primary hover:bg-accent-light hover:text-accent-dark hover:border-accent transition-all duration-200"
      >
        Sign out
      </button>
    </div>
  );
}
