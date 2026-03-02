"use client";

import { useEffect, useState } from "react";
import { SwipeStack } from "@/components/swipe-stack";
import type { RankedGig } from "@/types";

export default function SwipePage() {
  const [gigs, setGigs] = useState<RankedGig[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    const res = await fetch("/api/gigs/feed", { cache: "no-store" });
    const data = (await res.json()) as RankedGig[];
    setGigs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      const res = await fetch("/api/gigs/feed", { cache: "no-store" });
      const data = (await res.json()) as RankedGig[];
      if (!active) {
        return;
      }
      setGigs(Array.isArray(data) ? data : []);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">03 SWIPE MODE</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Find your next gig</h1>
      <p className="mt-1 text-sm text-zinc-600">Remaining gigs: {gigs.length}</p>

      <div className="mt-6 mx-auto w-full max-w-xl">
        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center text-zinc-600">Loading gigs...</div>
        ) : (
          <SwipeStack gigs={gigs} onSwiped={() => void refresh(true)} />
        )}
      </div>
    </section>
  );
}
