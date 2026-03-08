import fs from "node:fs";
import path from "node:path";

type JsonValue = Record<string, unknown> | Array<unknown>;

const dataDir = path.join(process.cwd(), "data");

function writeJson(fileName: string, value: JsonValue): void {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, fileName),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf-8",
  );
}

// ── Demo Users ──────────────────────────────────────────────────────────
// These are placeholder accounts. Real Google OAuth accounts get upserted
// on first login — the seed just pre-populates the demo story.

const CLIENT_ID = "demo-client-01";
const FREELANCER_ID = "demo-freelancer-01";

const users: JsonValue = [
  {
    id: CLIENT_ID,
    email: "dntqtqt@gmail.com",
    name: "Dante",
    avatar_url: "",
    role: "client",
    skills: [],
    hourly_rate_min: 0,
    hourly_rate_max: 0,
    bio: "Building products for Indonesian SMEs.",
    portfolio_url: "",
    mobile: "081234567890",
    mayar_customer_id: null,
    onboarded: true,
    created_at: "2026-03-01T08:00:00.000Z",
  },
  {
    id: FREELANCER_ID,
    email: "ramadhvni@gmail.com",
    name: "Rama",
    avatar_url: "",
    role: "freelancer",
    skills: ["nextjs", "typescript", "react", "tailwind", "nodejs"],
    hourly_rate_min: 150000,
    hourly_rate_max: 350000,
    bio: "Full-stack developer. 3 years shipping Next.js apps.",
    portfolio_url: "https://rama.dev",
    mobile: "089876543210",
    mayar_customer_id: null,
    onboarded: true,
    created_at: "2026-03-01T09:00:00.000Z",
  },
];

// ── Gigs ────────────────────────────────────────────────────────────────
// Gig 1 = completed match, Gig 2 = in_progress match
// Gig 9 = client's open gig with freelancer already interested (ready for pick demo)
// Gigs 3-8 = open gigs from other clients for swipe demo

const gigs: JsonValue = [
  {
    id: "gig-1",
    client_id: CLIENT_ID,
    client_name: "Dante",
    title: "Build Landing Page for SaaS Launch",
    description:
      "Responsive marketing page with hero, features, pricing, and CTA sections. Must score 90+ on Lighthouse. Tailwind + Framer Motion preferred.",
    budget_min: 3000000,
    budget_max: 7000000,
    required_skills: ["nextjs", "tailwind", "framer-motion"],
    deadline: "2026-03-18",
    status: "matched",
    created_at: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "gig-2",
    client_id: CLIENT_ID,
    client_name: "Dante",
    title: "Integrate Mayar Payment API",
    description:
      "Add invoice generation, payment link redirect, and webhook handling to existing Express backend. Must include error handling and retry logic.",
    budget_min: 4000000,
    budget_max: 10000000,
    required_skills: ["nodejs", "typescript", "rest-api"],
    deadline: "2026-03-22",
    status: "matched",
    created_at: "2026-03-02T10:00:00.000Z",
  },
  {
    id: "gig-3",
    client_id: "client-ext-01",
    client_name: "WarungCloud",
    title: "Redesign Mobile App Checkout Flow",
    description:
      "Product designer needed to redesign checkout and order tracking screens for Android and iOS. Deliver in Figma with design tokens.",
    budget_min: 2500000,
    budget_max: 5000000,
    required_skills: ["figma", "ui-ux", "design-system"],
    deadline: "2026-03-20",
    status: "open",
    created_at: "2026-03-02T12:00:00.000Z",
  },
  {
    id: "gig-4",
    client_id: "client-ext-02",
    client_name: "EduVerse",
    title: "Write 10 SEO Blog Articles on AI Tools",
    description:
      "Long-form content (1500+ words each) about AI productivity tools. Includes keyword research, meta descriptions, and internal linking strategy.",
    budget_min: 2000000,
    budget_max: 4500000,
    required_skills: ["seo", "copywriting", "content-marketing"],
    deadline: "2026-03-25",
    status: "open",
    created_at: "2026-03-03T08:00:00.000Z",
  },
  {
    id: "gig-5",
    client_id: "client-ext-03",
    client_name: "KopiKita",
    title: "Launch Meta Ads Campaign for Beverage Brand",
    description:
      "Set up and optimize 3 ad sets targeting Jakarta and Bandung. A/B test creatives, track ROAS, and deliver weekly reports.",
    budget_min: 1500000,
    budget_max: 4000000,
    required_skills: ["meta-ads", "analytics", "performance-marketing"],
    deadline: "2026-03-19",
    status: "open",
    created_at: "2026-03-03T10:00:00.000Z",
  },
  {
    id: "gig-6",
    client_id: "client-ext-04",
    client_name: "TravelMate",
    title: "Build Admin Dashboard with Real-Time Charts",
    description:
      "Internal analytics dashboard in React + TypeScript. Filter controls, KPI cards, and time-series charts. Connect to existing REST API.",
    budget_min: 3500000,
    budget_max: 8500000,
    required_skills: ["react", "typescript", "data-visualization"],
    deadline: "2026-03-24",
    status: "open",
    created_at: "2026-03-03T14:00:00.000Z",
  },
  {
    id: "gig-7",
    client_id: "client-ext-05",
    client_name: "PixelStudio",
    title: "Edit 20 Short-Form Reels for Instagram",
    description:
      "Need video editor for IG and TikTok reels with captions, hooks, and quick transitions. CapCut or Premiere Pro. Deliver within 5 days.",
    budget_min: 1800000,
    budget_max: 4200000,
    required_skills: ["video-editing", "capcut", "storytelling"],
    deadline: "2026-03-21",
    status: "open",
    created_at: "2026-03-04T08:00:00.000Z",
  },
  {
    id: "gig-8",
    client_id: "client-ext-06",
    client_name: "LocalMart",
    title: "Optimize Core Web Vitals for E-Commerce Site",
    description:
      "Frontend performance audit and fixes. Target: LCP < 2.5s, CLS < 0.1, INP < 200ms. Next.js site with 50+ product pages.",
    budget_min: 2500000,
    budget_max: 6000000,
    required_skills: ["web-performance", "nextjs", "lighthouse"],
    deadline: "2026-03-23",
    status: "open",
    created_at: "2026-03-04T12:00:00.000Z",
  },
  // ── Client's open gig with freelancer already interested (for pick demo) ──
  {
    id: "gig-9",
    client_id: CLIENT_ID,
    client_name: "Dante",
    title: "Build Real-Time Notification System",
    description:
      "WebSocket-based notification service for a Next.js app. Push notifications for matches, payments, and deliveries. TypeScript + Redis pub/sub.",
    budget_min: 3000000,
    budget_max: 8000000,
    required_skills: ["nodejs", "typescript", "websocket", "nextjs"],
    deadline: "2026-03-26",
    status: "open",
    created_at: "2026-03-05T10:00:00.000Z",
  },
];

// ── Swipes ──────────────────────────────────────────────────────────────
// Pre-seed swipes to set up the demo story:
// - Right on gig-1, gig-2 (matched)
// - Right on gig-9 (client's open gig — ready for pick demo, clip 4-5)
// - Left on non-tech gigs (gig-3 design, gig-4 SEO, gig-5 ads, gig-7 video)
//   so the swipe feed (clip 2-3) only shows tech gigs the freelancer hasn't seen
// - Gig-6 (dashboard), gig-8 (web vitals) left unswiped for live swipe demo

const swipes: JsonValue = [
  // Matched gigs
  {
    id: "swipe-demo-01",
    user_id: FREELANCER_ID,
    gig_id: "gig-1",
    direction: "right",
    created_at: "2026-03-02T11:00:00.000Z",
  },
  {
    id: "swipe-demo-02",
    user_id: FREELANCER_ID,
    gig_id: "gig-2",
    direction: "right",
    created_at: "2026-03-03T11:00:00.000Z",
  },
  // Ready for client pick demo
  {
    id: "swipe-demo-03",
    user_id: FREELANCER_ID,
    gig_id: "gig-9",
    direction: "right",
    created_at: "2026-03-05T12:00:00.000Z",
  },
  // Left swipes — freelancer already skipped non-tech gigs
  {
    id: "swipe-demo-04",
    user_id: FREELANCER_ID,
    gig_id: "gig-3",
    direction: "left",
    created_at: "2026-03-04T09:00:00.000Z",
  },
  {
    id: "swipe-demo-05",
    user_id: FREELANCER_ID,
    gig_id: "gig-4",
    direction: "left",
    created_at: "2026-03-04T09:01:00.000Z",
  },
  {
    id: "swipe-demo-06",
    user_id: FREELANCER_ID,
    gig_id: "gig-5",
    direction: "left",
    created_at: "2026-03-04T09:02:00.000Z",
  },
  {
    id: "swipe-demo-07",
    user_id: FREELANCER_ID,
    gig_id: "gig-7",
    direction: "left",
    created_at: "2026-03-04T09:03:00.000Z",
  },
];

// ── Matches ─────────────────────────────────────────────────────────────
// Match 1: completed (full lifecycle done — shows earnings on dashboard)
// Match 2: in_progress (freelancer can demo "Mark as Delivered")

const matches: JsonValue = [
  {
    id: "match-demo-01",
    gig_id: "gig-1",
    freelancer_id: FREELANCER_ID,
    client_id: CLIENT_ID,
    agreed_amount: 5000000,
    status: "completed",
    mayar_invoice_id: "mock-match-demo-01",
    mayar_invoice_url: null,
    paid_at: "2026-03-04T10:00:00.000Z",
    created_at: "2026-03-03T12:00:00.000Z",
  },
  {
    id: "match-demo-02",
    gig_id: "gig-2",
    freelancer_id: FREELANCER_ID,
    client_id: CLIENT_ID,
    agreed_amount: 7000000,
    status: "in_progress",
    mayar_invoice_id: "mock-match-demo-02",
    mayar_invoice_url: null,
    paid_at: "2026-03-05T09:00:00.000Z",
    created_at: "2026-03-04T14:00:00.000Z",
  },
];

writeJson("users.json", users);
writeJson("gigs.json", gigs);
writeJson("swipes.json", swipes);
writeJson("matches.json", matches);

console.log("Seeded data/*.json with demo data");
console.log("");
console.log("Demo story pre-loaded:");
console.log("  - 1 completed match (gig-1: Landing Page) -> shows earnings on dashboard");
console.log("  - 1 in-progress match (gig-2: Payment API) -> freelancer can deliver");
console.log("  - 1 open gig with interest (gig-9: Notification System) -> ready for client pick demo");
console.log("  - 2 open gigs unswiped (gig-6: Dashboard, gig-8: Web Vitals) -> ready for live swipe");
console.log("  - 4 gigs already left-swiped (gig-3,4,5,7) -> won't appear in feed");
console.log("");
console.log("Login with Google to replace demo user IDs with real OAuth accounts.");
