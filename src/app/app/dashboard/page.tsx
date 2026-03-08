"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { formatDate, formatIDR } from "@/lib/format";

interface MyGig {
  id: string;
  title: string;
  status: string;
  interested_count: number;
}

interface ActivityItem {
  id: string;
  gig_title: string;
  amount: number;
  status: string;
  paid: boolean;
  date: string;
}

interface DashboardData {
  role: string;
  stats: {
    total_earnings: number;
    pending_payments: number;
    completed_gigs: number;
    active_matches: number;
  };
  transactions: Array<{
    id: string;
    credit: number;
    status: string;
    paymentMethod: string;
    createdAt: number;
  }>;
  activity: ActivityItem[];
  myGigs: MyGig[];
}

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  pending: { label: "Pending", icon: "solar:clock-circle-linear", color: "text-amber-600 bg-amber-50" },
  accepted: { label: "Accepted", icon: "solar:check-circle-linear", color: "text-blue-600 bg-blue-50" },
  in_progress: { label: "In Progress", icon: "solar:play-circle-linear", color: "text-blue-600 bg-blue-50" },
  delivered: { label: "Delivered", icon: "solar:box-linear", color: "text-indigo-600 bg-indigo-50" },
  completed: { label: "Completed", icon: "solar:check-circle-bold", color: "text-emerald-600 bg-emerald-50" },
};

const STAT_ICONS = [
  "solar:wallet-linear",
  "solar:clock-circle-linear",
  "solar:check-circle-linear",
  "solar:play-circle-linear",
];

const STAT_BORDER_COLORS = [
  "border-l-accent",
  "border-l-amber-400",
  "border-l-blue-400",
  "border-l-emerald-400",
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    void fetch("/api/dashboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => setData(payload as DashboardData));
  }, []);

  const stats = data?.stats;

  const statCards = [
    { label: "Total Earnings", value: formatIDR(stats?.total_earnings ?? 0), isEarnings: true },
    { label: "Pending", value: String(stats?.pending_payments ?? 0), isEarnings: false },
    { label: "Completed", value: String(stats?.completed_gigs ?? 0), isEarnings: false },
    { label: "Active", value: String(stats?.active_matches ?? 0), isEarnings: false },
  ];

  const activity = data?.activity ?? [];
  const myGigs = data?.myGigs ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-xs font-semibold tracking-[0.2em] text-accent">06 DASHBOARD</p>
      <h1 className="mt-2 text-2xl font-semibold text-text-primary">Payment overview</h1>

      <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`rounded-xl border border-border border-l-4 ${STAT_BORDER_COLORS[index]} bg-surface p-4 overflow-hidden`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={STAT_ICONS[index]} width={14} height={14} className="text-text-muted shrink-0" />
                <p className="text-xs uppercase tracking-wide text-text-muted truncate">{card.label}</p>
              </div>
              <p className={`text-lg sm:text-xl font-semibold truncate ${card.isEarnings ? "text-accent-dark" : "text-text-primary"}`}>
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* My Gigs — client only */}
      {myGigs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary">My gigs</h2>
          <div className="mt-3 grid gap-3">
            {myGigs.map((gig, index) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{gig.title}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {gig.status === "matched" ? "Matched" : `${gig.interested_count} interested`}
                    </p>
                  </div>
                  {gig.status !== "matched" && gig.interested_count > 0 && (
                    <Link
                      href={`/app/gig/${gig.id}/interested`}
                      className="ml-3 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-all duration-200 shrink-0"
                    >
                      <Icon icon="solar:users-group-rounded-outline" width="16" height="16" />
                      View
                    </Link>
                  )}
                  {gig.status === "matched" && (
                    <span className="ml-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 shrink-0">
                      Matched
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Activity feed — from local match data */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">Recent activity</h2>

        {activity.length === 0 && !data ? (
          <div className="mt-3 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
            <Icon icon="solar:history-linear" width={32} height={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm text-text-muted">No activity yet. Matches will appear here.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {activity.map((item, index) => {
              const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
                >
                  {/* Status icon */}
                  <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${config.color}`}>
                    <Icon icon={config.icon} width={18} height={18} />
                  </div>

                  {/* Gig info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{item.gig_title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{formatDate(item.date)}</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-text-primary">{formatIDR(item.amount)}</p>
                    <div className="mt-0.5 flex items-center gap-1 justify-end">
                      {item.paid && (
                        <Icon icon="solar:check-circle-bold" width={12} height={12} className="text-emerald-500" />
                      )}
                      <span className={`text-xs font-medium ${item.paid ? "text-emerald-600" : "text-text-muted"}`}>
                        {item.paid ? "Paid" : config.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mayar transactions — only if available */}
      {(data?.transactions ?? []).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary">Mayar transactions</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="min-w-full text-sm">
              <thead className="bg-accent-light text-left text-text-primary">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-border-light">
                    <td className="px-4 py-3">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">{formatIDR(tx.credit)}</td>
                    <td className="px-4 py-3">{tx.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.section>
  );
}
