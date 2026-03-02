"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/match-card";

interface MatchItem {
  id: string;
  gig_title: string;
  status: string;
  payment_status: string;
  mayar_invoice_url?: string | null;
}

export default function MatchesPage() {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/matches", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <section>
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">04 MATCHES</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Your active matches</h1>

      <div className="mt-6 grid gap-4">
        {loading ? <p className="text-sm text-zinc-600">Loading...</p> : null}
        {!loading && items.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-zinc-600">No matches yet.</p>
        ) : null}
        {items.map((item) => (
          <MatchCard key={item.id} match={item} />
        ))}
      </div>
    </section>
  );
}
