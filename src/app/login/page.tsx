"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">LANCERIN</p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">Sign in to continue</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use Google to access swipe-based freelance matching.
        </p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/app/swipe" })}
          className="mt-6 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
