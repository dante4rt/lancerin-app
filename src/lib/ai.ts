import type { AIMatchResult, Gig, Swipe, User } from "@/types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "minimax/minimax-m2.5";

function fallbackRanking(gigs: Gig[]): AIMatchResult[] {
  return gigs.map((gig, index) => ({
    gig_id: gig.id,
    score: Math.max(50, 90 - index * 3),
    reason: "Fallback relevance order",
  }));
}

export async function rankGigsForUser(
  user: User,
  gigs: Gig[],
  swipeHistory: Swipe[],
): Promise<AIMatchResult[]> {
  if (!OPENROUTER_API_KEY || gigs.length === 0) {
    return fallbackRanking(gigs);
  }

  const rightSwipedGigIds = new Set(
    swipeHistory.filter((s) => s.direction === "right").map((s) => s.gig_id),
  );

  const liked = gigs
    .filter((g) => rightSwipedGigIds.has(g.id))
    .map((g) => `${g.title} [${g.required_skills.join(", ")}]`)
    .join("; ");

  const prompt = `You are a gig matching assistant for Lancerin.

Freelancer profile:
- Skills: ${user.skills.join(", ") || "none listed"}
- Rate range: ${user.hourly_rate_min}-${user.hourly_rate_max} IDR/hour
- Bio: ${user.bio || "n/a"}
- Previously liked: ${liked || "no history"}

Gigs:
${gigs
  .map(
    (g, i) =>
      `${i + 1}. id=${g.id}; title=${g.title}; budget=${g.budget_min}-${g.budget_max}; skills=${g.required_skills.join(",")}`,
  )
  .join("\n")}

Return JSON array only: [{"gig_id":"...","score":0-100,"reason":"short"}] sorted by score desc.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      return fallbackRanking(gigs);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "[]";
    const matched = content.match(/\[[\s\S]*\]/);
    if (!matched) {
      return fallbackRanking(gigs);
    }

    const parsed = JSON.parse(matched[0]) as AIMatchResult[];
    const valid = parsed.filter((item) => gigs.some((g) => g.id === item.gig_id));
    return valid.length > 0 ? valid : fallbackRanking(gigs);
  } catch {
    return fallbackRanking(gigs);
  }
}
