"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { RankedGig, SwipeDirection } from "@/types";
import { SwipeCard } from "@/components/swipe-card";

interface SwipeStackProps {
  gigs: RankedGig[];
  onSwiped?: () => void;
}

const SWIPE_THRESHOLD = 120;

export function SwipeStack({ gigs, onSwiped }: SwipeStackProps) {
  const [index, setIndex] = useState(0);
  const remaining = useMemo(() => gigs.slice(index), [gigs, index]);

  const handleSwipe = async (direction: SwipeDirection) => {
    const current = gigs[index];
    if (!current) {
      return;
    }

    await fetch("/api/swipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gig_id: current.id, direction }),
    });

    setIndex((prev) => prev + 1);
    onSwiped?.();
  };

  if (!remaining.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600">
        No more gigs. Check back later.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative h-[500px]">
        {remaining.slice(0, 3).map((gig, stackIndex) => {
          const isTop = stackIndex === 0;
          return (
            <motion.div
              key={gig.id}
              className="absolute inset-0"
              style={{
                scale: 1 - stackIndex * 0.03,
                y: stackIndex * 10,
                zIndex: 30 - stackIndex,
              }}
              drag={isTop ? "x" : false}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (!isTop) {
                  return;
                }
                if (info.offset.x > SWIPE_THRESHOLD) {
                  void handleSwipe("right");
                } else if (info.offset.x < -SWIPE_THRESHOLD) {
                  void handleSwipe("left");
                }
              }}
            >
              <SwipeCard gig={gig} />
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => void handleSwipe("left")}
          className="rounded-full border border-rose-300 bg-rose-50 px-6 py-2 text-sm font-semibold text-rose-700"
        >
          Pass
        </button>
        <button
          type="button"
          onClick={() => void handleSwipe("right")}
          className="rounded-full border border-emerald-300 bg-emerald-50 px-6 py-2 text-sm font-semibold text-emerald-700"
        >
          Interested
        </button>
      </div>
    </div>
  );
}
