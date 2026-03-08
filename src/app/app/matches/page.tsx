"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { MatchCard } from "@/components/match-card";

interface MatchItem {
  id: string;
  gig_title: string;
  gig_budget: number;
  status: string;
  payment_status: string;
  viewer_role: string;
  mayar_invoice_url?: string | null;
}

export default function MatchesPage() {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchMatches = useCallback(async (showSyncIndicator = false) => {
    if (showSyncIndicator) setSyncing(true);
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void fetchMatches();
  }, [fetchMatches]);

  // Re-fetch when tab regains focus (user returning from Mayar payment)
  useEffect(() => {
    const onFocus = () => void fetchMatches(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchMatches]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent">04 MATCHES</p>
          <h1 className="mt-2 text-2xl font-semibold text-text-primary">Your active matches</h1>
        </div>
        <button
          type="button"
          onClick={() => void fetchMatches(true)}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent transition-all duration-200 disabled:opacity-50"
        >
          <Icon
            icon="solar:refresh-linear"
            width={14}
            height={14}
            className={syncing ? "animate-spin" : ""}
          />
          {syncing ? "Syncing..." : "Refresh"}
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <>
            <div className="h-20 rounded-xl bg-surface animate-pulse" />
            <div className="h-20 rounded-xl bg-surface animate-pulse" />
            <div className="h-20 rounded-xl bg-surface animate-pulse" />
          </>
        ) : null}
        {!loading && items.length === 0 ? (
          <p className="rounded-xl bg-surface border border-dashed border-border p-4 text-sm text-text-secondary">No matches yet.</p>
        ) : null}
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MatchCard
              match={item}
              onStatusChange={(id, newStatus) => {
                setItems((prev) =>
                  prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)),
                );
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
