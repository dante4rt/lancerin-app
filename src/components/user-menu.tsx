"use client";

import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data } = useSession();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3">
      <p className="text-sm font-semibold text-zinc-900">{data?.user?.name ?? "Guest"}</p>
      <p className="text-xs text-zinc-500">{data?.user?.email ?? "Not signed in"}</p>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
      >
        Sign out
      </button>
    </div>
  );
}
