"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { SwipeStack } from "@/components/swipe-stack";
import type { RankedGig } from "@/types";

function SwipeSkeleton() {
  return (
    <div className="flex h-[500px] items-center justify-center rounded-2xl border border-border bg-surface">
      <div className="flex flex-col items-center gap-3">
        <Icon icon="solar:refresh-bold-duotone" width="32" height="32" className="text-accent animate-spin" />
        <p className="text-sm font-medium text-text-secondary">AI is ranking gigs for you...</p>
      </div>
    </div>
  );
}

export default function SwipePage() {
  const [gigs, setGigs] = useState<RankedGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipedCount, setSwipedCount] = useState(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      const res = await fetch("/api/gigs/feed", { cache: "no-store" });
      const data = (await res.json()) as RankedGig[];
      if (!active) {
        return;
      }
      setGigs(Array.isArray(data) ? data : []);
      setSwipedCount(0);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p className="text-xs font-semibold tracking-[0.2em] text-accent">
        03 SWIPE MODE
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-text-primary">
        Find your next gig
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {loading ? "Loading gigs..." : `Remaining gigs: ${Math.max(gigs.length - swipedCount, 0)}`}
      </p>

      <div className="mt-6 mx-auto w-full max-w-xl">
        {loading ? (
          <SwipeSkeleton />
        ) : (
          <SwipeStack gigs={gigs} onSwiped={() => setSwipedCount((prev) => prev + 1)} />
        )}
      </div>
    </motion.section>
  );
}
