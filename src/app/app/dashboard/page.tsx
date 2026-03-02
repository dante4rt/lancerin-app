"use client";

import { useEffect, useState } from "react";
import { formatDate, formatIDR } from "@/lib/format";

interface DashboardData {
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
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    void fetch("/api/dashboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => setData(payload as DashboardData));
  }, []);

  const stats = data?.stats;

  return (
    <section>
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">06 DASHBOARD</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Payment overview</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total Earnings" value={formatIDR(stats?.total_earnings ?? 0)} />
        <StatCard label="Pending" value={String(stats?.pending_payments ?? 0)} />
        <StatCard label="Completed" value={String(stats?.completed_gigs ?? 0)} />
        <StatCard label="Active" value={String(stats?.active_matches ?? 0)} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-100 text-left text-zinc-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.transactions ?? []).map((tx) => (
              <tr key={tx.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">{formatDate(tx.createdAt)}</td>
                <td className="px-4 py-3">{formatIDR(tx.credit)}</td>
                <td className="px-4 py-3">{tx.paymentMethod}</td>
                <td className="px-4 py-3">{tx.status}</td>
              </tr>
            ))}
            {(data?.transactions ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={4}>
                  No transaction data yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
