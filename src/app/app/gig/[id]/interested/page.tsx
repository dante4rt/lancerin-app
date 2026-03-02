"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Freelancer {
  id: string;
  name: string;
  avatar_url: string;
  skills: string[];
  bio: string;
  hourly_rate_min: number;
  hourly_rate_max: number;
}

interface GigPayload {
  gig: { id: string; title: string };
  freelancers: Freelancer[];
}

export default function InterestedFreelancersPage() {
  const params = useParams<{ id: string }>();
  const gigId = params.id;
  const [payload, setPayload] = useState<GigPayload | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!gigId) {
      return;
    }

    void fetch(`/api/gigs/${gigId}/interested`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setPayload(data as GigPayload);
        }
      });
  }, [gigId]);

  const pickFreelancer = async (freelancerId: string) => {
    setMessage("Creating match...");
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gig_id: gigId, freelancer_id: freelancerId }),
    });

    if (!res.ok) {
      setMessage("Failed to create match.");
      return;
    }

    const data = (await res.json()) as { mayar_invoice_url?: string };
    setMessage(data.mayar_invoice_url ? `Match created. Invoice: ${data.mayar_invoice_url}` : "Match created.");
  };

  return (
    <section>
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">05 CLIENT PICK</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Interested freelancers</h1>
      <p className="mt-1 text-sm text-zinc-600">Gig: {payload?.gig.title ?? "Loading..."}</p>

      <div className="mt-6 grid gap-4">
        {(payload?.freelancers ?? []).map((f) => (
          <div key={f.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold text-zinc-900">{f.name}</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Rate: Rp {f.hourly_rate_min.toLocaleString("id-ID")} - Rp {f.hourly_rate_max.toLocaleString("id-ID")}
            </p>
            <p className="mt-2 text-sm text-zinc-700">{f.bio || "No bio"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {f.skills.map((s) => (
                <span key={s} className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
                  {s}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void pickFreelancer(f.id)}
              className="mt-4 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Pick This Freelancer
            </button>
          </div>
        ))}
      </div>

      {message ? <p className="mt-4 text-sm text-zinc-700">{message}</p> : null}
    </section>
  );
}
