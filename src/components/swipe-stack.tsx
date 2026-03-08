"use client";

import { useMemo, useState, useCallback } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { RankedGig, SwipeDirection } from "@/types";
import { SwipeCard } from "@/components/swipe-card";

interface SwipeStackProps {
  gigs: RankedGig[];
  onSwiped?: () => void;
}

const SWIPE_THRESHOLD = 120;
const SWIPE_EXIT_DISTANCE = 420;

export function SwipeStack({ gigs, onSwiped }: SwipeStackProps) {
  const [index, setIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const remaining = useMemo(() => gigs.slice(index), [gigs, index]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleSwipe = useCallback(
    async (direction: SwipeDirection) => {
      if (isSwiping) {
        return;
      }

      const current = gigs[index];
      if (!current) {
        return;
      }

      setIsSwiping(true);

      // If card hasn't been dragged (button click), animate x first
      // so the LIKE/PASS overlay and rotation show before exit
      if (Math.abs(x.get()) < SWIPE_THRESHOLD) {
        const target = direction === "right" ? 150 : -150;
        await animate(x, target, { duration: 0.15, ease: "easeOut" });
      }

      const apiPromise = fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gig_id: current.id, direction }),
      });

      const exitTarget = direction === "right" ? SWIPE_EXIT_DISTANCE : -SWIPE_EXIT_DISTANCE;
      await animate(x, exitTarget, { duration: 0.24, ease: "easeOut" });

      const apiResponse = await apiPromise;
      if (!apiResponse.ok) {
        await animate(x, 0, { duration: 0.18, ease: "easeOut" });
        setIsSwiping(false);
        return;
      }

      x.set(0);
      setIndex((prev) => prev + 1);
      onSwiped?.();
      setIsSwiping(false);
    },
    [gigs, index, isSwiping, onSwiped, x],
  );

  if (!remaining.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
        No more gigs. Check back later.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative h-[500px]">
        {remaining.slice(0, 3).map((gig, stackIndex) => {
          const isTop = stackIndex === 0;

          if (isTop) {
            return (
              <motion.div
                key={gig.id}
                className={`absolute inset-0 ${isSwiping ? "pointer-events-none" : ""}`}
                style={{
                  x,
                  rotate,
                  zIndex: 30,
                }}
                drag={isSwiping ? false : "x"}
                dragElastic={0.2}
                dragConstraints={{ left: 0, right: 0 }}
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                  if (info.offset.x > SWIPE_THRESHOLD) {
                    void handleSwipe("right");
                  } else if (info.offset.x < -SWIPE_THRESHOLD) {
                    void handleSwipe("left");
                  }
                }}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-emerald-500/20"
                  style={{ opacity: likeOpacity }}
                >
                  <span className="-rotate-12 text-4xl font-bold text-emerald-600">
                    LIKE
                  </span>
                </motion.div>
                <motion.div
                  className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-rose-500/20"
                  style={{ opacity: passOpacity }}
                >
                  <span className="rotate-12 text-4xl font-bold text-rose-600">
                    PASS
                  </span>
                </motion.div>
                <SwipeCard gig={gig} />
              </motion.div>
            );
          }

          return (
            <motion.div
              key={gig.id}
              className="absolute inset-0"
              style={{
                scale: 1 - stackIndex * 0.03,
                y: stackIndex * 10,
                zIndex: 30 - stackIndex,
              }}
              initial={false}
            >
              <div className="opacity-90 shadow-sm">
                <SwipeCard gig={gig} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          disabled={isSwiping}
          onClick={() => void handleSwipe("left")}
          className="rounded-full border border-rose-300 bg-rose-50 px-6 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Pass
        </button>
        <button
          type="button"
          disabled={isSwiping}
          onClick={() => void handleSwipe("right")}
          className="rounded-full border border-accent bg-accent-light px-6 py-2 text-sm font-semibold text-accent-dark hover:bg-accent hover:text-white active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Interested
        </button>
      </div>
    </div>
  );
}
