"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

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
  gig: { id: string; title: string; budget_min: number; budget_max: number };
  freelancers: Freelancer[];
}

type PickState = "idle" | "loading" | "success" | "error";

export default function InterestedFreelancersPage() {
  const params = useParams<{ id: string }>();
  const gigId = params.id;
  const [payload, setPayload] = useState<GigPayload | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pickState, setPickState] = useState<PickState>("idle");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (!gigId) return;

    void fetch(`/api/gigs/${gigId}/interested`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          const p = data as GigPayload;
          setPayload(p);
          setAmount(p.gig.budget_max);
        }
        setPageLoading(false);
      });
  }, [gigId]);

  const pickFreelancer = async (freelancerId: string) => {
    setPickState("loading");
    setPickedId(freelancerId);
    setErrorMsg("");

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gig_id: gigId, freelancer_id: freelancerId, amount }),
    });

    if (!res.ok) {
      setPickState("error");
      setErrorMsg("Failed to create match. Try again.");
      return;
    }

    const data = (await res.json()) as { mayar_invoice_url?: string };
    setPickState("success");
    setInvoiceUrl(data.mayar_invoice_url ?? null);
  };

  const isDisabled = pickState === "loading" || pickState === "success";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-xs font-semibold tracking-[0.2em] text-accent">05 CLIENT PICK</p>
      <h1 className="mt-2 text-2xl font-semibold text-text-primary">Interested freelancers</h1>
      <p className="mt-1 text-sm text-text-secondary">Gig: {payload?.gig.title ?? "Loading..."}</p>

      <div className="mt-6 grid gap-4">
        {pageLoading && (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-accent-light" />
                  <div className="h-4 w-32 rounded bg-accent-light" />
                </div>
                <div className="h-3 w-48 rounded bg-accent-light/60 mb-2" />
                <div className="h-3 w-64 rounded bg-accent-light/40 mb-3" />
                <div className="flex gap-2">
                  <div className="h-6 w-14 rounded-full bg-accent-light" />
                  <div className="h-6 w-18 rounded-full bg-accent-light" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!pageLoading && (payload?.freelancers ?? []).length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <Icon icon="solar:users-group-rounded-outline" width="40" height="40" className="mx-auto text-text-muted" />
            <p className="mt-3 text-sm text-text-muted">No freelancers have swiped right on this gig yet.</p>
          </div>
        )}

        {(payload?.freelancers ?? []).map((f, index) => {
          const isThisPicked = pickedId === f.id;
          const isThisLoading = isThisPicked && pickState === "loading";
          const isThisSuccess = isThisPicked && pickState === "success";

          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`rounded-xl border bg-surface p-4 transition-all duration-200 ${
                isThisSuccess ? "border-emerald-300 bg-emerald-50/50" : "border-border"
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={`https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(f.name)}`}
                    alt=""
                    className="h-10 w-10 rounded-full bg-accent-light shrink-0"
                  />
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">{f.name}</h2>
                    {isThisSuccess && (
                      <span className="text-xs font-medium text-emerald-600">Matched</span>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  Rate: Rp {f.hourly_rate_min.toLocaleString("id-ID")} - Rp {f.hourly_rate_max.toLocaleString("id-ID")}
                </p>
                <p className="mt-2 text-sm text-text-primary">{f.bio || "No bio"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {f.skills.map((s) => (
                    <span key={s} className="rounded-full bg-accent-light px-2 py-1 text-xs text-accent-dark">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Agreed amount input */}
                {!isDisabled && payload?.gig && (
                  <div className="mt-4 mb-2">
                    <label className="text-xs font-medium text-text-muted block mb-1">
                      Agreed amount (Rp {payload.gig.budget_min.toLocaleString("id-ID")} – Rp {payload.gig.budget_max.toLocaleString("id-ID")})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={payload.gig.budget_min}
                      max={payload.gig.budget_max}
                      step={50000}
                      className="w-full max-w-[220px] rounded-lg border border-border px-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                )}

                {isThisSuccess && invoiceUrl ? (
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-all duration-200"
                  >
                    <Icon icon="solar:card-send-outline" width="16" height="16" />
                    Pay Invoice via Mayar
                  </a>
                ) : isThisSuccess ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                    <Icon icon="solar:check-circle-outline" width="16" height="16" />
                    Match created
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => void pickFreelancer(f.id)}
                    className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isDisabled
                        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                        : "bg-accent text-white hover:bg-accent-hover"
                    }`}
                  >
                    {isThisLoading ? (
                      <>
                        <Icon icon="solar:refresh-bold-duotone" width="16" height="16" className="animate-spin" />
                        Creating match...
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:hand-shake-outline" width="16" height="16" />
                        Pick This Freelancer
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {pickState === "error" && errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <Icon icon="solar:danger-triangle-outline" width="16" height="16" />
          {errorMsg}
        </motion.div>
      )}
    </motion.section>
  );
}
