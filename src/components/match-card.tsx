"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface MatchCardProps {
  match: {
    id: string;
    gig_title: string;
    gig_budget: number;
    status: string;
    payment_status: string;
    viewer_role: string;
    mayar_invoice_url?: string | null;
  };
  onStatusChange?: (matchId: string, newStatus: string) => void;
}

interface StatusView {
  badge: string;
  badgeClass: string;
  badgeIcon: string;
  hint: string;
}

function getStatusView(status: string, paymentStatus: string, isClient: boolean): StatusView {
  if (status === "completed") {
    return {
      badge: "Completed",
      badgeClass: "bg-emerald-100 text-emerald-700",
      badgeIcon: "solar:check-circle-outline",
      hint: "This gig has been delivered and paid.",
    };
  }

  if (status === "delivered") {
    return {
      badge: "Delivered",
      badgeClass: "bg-blue-100 text-blue-700",
      badgeIcon: "solar:inbox-archive-outline",
      hint: isClient
        ? "The freelancer has delivered. Review and confirm to complete."
        : "You've submitted your work. Waiting for client confirmation.",
    };
  }

  if (status === "in_progress") {
    return {
      badge: "In Progress",
      badgeClass: "bg-accent-light text-accent-dark",
      badgeIcon: "solar:bolt-circle-outline",
      hint: isClient
        ? "Payment received. The freelancer is working on your gig."
        : "Client has paid. Start working and deliver your best.",
    };
  }

  // pending
  return {
    badge: paymentStatus === "paid" ? "Paid" : "Awaiting Payment",
    badgeClass: "bg-amber-100 text-amber-700",
    badgeIcon: "solar:clock-circle-outline",
    hint: isClient
      ? "Complete payment to start the project."
      : "You've been picked. Work begins after the client pays.",
  };
}

export function MatchCard({ match, onStatusChange }: MatchCardProps) {
  const [busy, setBusy] = useState(false);
  const isClient = match.viewer_role === "client";
  const isFreelancer = match.viewer_role === "freelancer";
  const isPending = match.status === "pending";
  const view = getStatusView(match.status, match.payment_status, isClient);

  async function handleAction(action: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: match.id, action }),
      });
      if (res.ok) {
        const updated = await res.json();
        onStatusChange?.(match.id, updated.status);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-text-primary">{match.gig_title}</h3>
          <p className="mt-1 text-sm text-text-muted">
            Rp {match.gig_budget.toLocaleString("id-ID")}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${view.badgeClass}`}>
          <Icon icon={view.badgeIcon} width="14" height="14" />
          {view.badge}
        </span>
      </div>

      <p className="mt-3 text-sm text-text-secondary">{view.hint}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {isPending && isClient && match.mayar_invoice_url && (
          <a
            href={match.mayar_invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-all duration-200"
          >
            <Icon icon="solar:card-send-outline" width="16" height="16" />
            Pay via Mayar
          </a>
        )}

        {match.status === "in_progress" && isFreelancer && (
          <button
            onClick={() => handleAction("deliver")}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
          >
            <Icon icon={busy ? "solar:refresh-outline" : "solar:inbox-archive-outline"} width="16" height="16" className={busy ? "animate-spin" : ""} />
            {busy ? "Submitting..." : "Mark as Delivered"}
          </button>
        )}

        {match.status === "delivered" && isClient && (
          <button
            onClick={() => handleAction("complete")}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200"
          >
            <Icon icon={busy ? "solar:refresh-outline" : "solar:check-circle-outline"} width="16" height="16" className={busy ? "animate-spin" : ""} />
            {busy ? "Confirming..." : "Confirm Delivery"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
