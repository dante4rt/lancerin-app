import { formatIDR } from "@/lib/format";
import type { RankedGig } from "@/types";

interface SwipeCardProps {
  gig: RankedGig;
}

export function SwipeCard({ gig }: SwipeCardProps) {
  return (
    <article className="relative flex h-[460px] w-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {typeof gig.ai_score === "number" && (
        <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          {Math.round(gig.ai_score)}% Match
        </span>
      )}

      <h2 className="pr-20 text-2xl font-semibold text-zinc-900">{gig.title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{gig.client_name}</p>
      <p className="mt-3 text-lg font-medium text-zinc-800">
        {formatIDR(gig.budget_min)} - {formatIDR(gig.budget_max)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {gig.required_skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
          >
            {skill}
          </span>
        ))}
      </div>

      <p className="mt-5 line-clamp-5 text-sm leading-6 text-zinc-700">{gig.description}</p>

      <div className="mt-auto pt-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Deadline</p>
        <p className="text-sm font-medium text-zinc-800">{gig.deadline}</p>
        {gig.ai_reason ? (
          <p className="mt-2 text-xs text-zinc-500">AI Note: {gig.ai_reason}</p>
        ) : null}
      </div>
    </article>
  );
}
