import Link from "next/link";

interface MatchCardProps {
  match: {
    id: string;
    gig_title: string;
    status: string;
    payment_status: string;
    mayar_invoice_url?: string | null;
  };
}

function statusClass(status: string): string {
  if (status === "completed") return "bg-blue-100 text-blue-700";
  if (status === "in_progress") return "bg-emerald-100 text-emerald-700";
  return "bg-amber-100 text-amber-700";
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900">{match.gig_title}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(match.status)}`}>
          {match.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-zinc-600">Payment: {match.payment_status}</p>

      {match.mayar_invoice_url ? (
        <Link
          href={match.mayar_invoice_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Open Mayar Invoice
        </Link>
      ) : null}
    </div>
  );
}
