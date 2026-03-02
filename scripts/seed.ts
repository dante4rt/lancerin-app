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

const users: JsonValue = [];
const swipes: JsonValue = [];
const matches: JsonValue = [];

const gigs: JsonValue = [
  {
    id: "gig-1",
    client_id: "client-demo-1",
    client_name: "Nusantara SaaS",
    title: "Build Marketing Landing Page in Next.js",
    description:
      "Need a responsive landing page with conversion-focused sections and fast loading performance for a SaaS launch.",
    budget_min: 3000000,
    budget_max: 7000000,
    required_skills: ["nextjs", "tailwind", "framer-motion"],
    deadline: "2026-03-18",
    status: "open",
    created_at: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "gig-2",
    client_id: "client-demo-2",
    client_name: "WarungCloud",
    title: "Redesign Mobile App UI in Figma",
    description:
      "Looking for product designer to redesign checkout and order tracking flows for Android and iOS users.",
    budget_min: 2500000,
    budget_max: 5000000,
    required_skills: ["figma", "ui-ux", "design-system"],
    deadline: "2026-03-16",
    status: "open",
    created_at: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "gig-3",
    client_id: "client-demo-3",
    client_name: "EduVerse",
    title: "Create 10 SEO Blog Articles (Tech)",
    description:
      "Need long-form blog content around AI tools and productivity software. Includes keyword research and on-page SEO.",
    budget_min: 2000000,
    budget_max: 4500000,
    required_skills: ["seo", "copywriting", "content-marketing"],
    deadline: "2026-03-20",
    status: "open",
    created_at: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "gig-4",
    client_id: "client-demo-4",
    client_name: "KopiKita",
    title: "Set Up Meta Ads for New Campaign",
    description:
      "Launch and optimize 3 ad sets for a beverage campaign targeting Jakarta and Bandung audiences.",
    budget_min: 1500000,
    budget_max: 4000000,
    required_skills: ["meta-ads", "analytics", "performance-marketing"],
    deadline: "2026-03-14",
    status: "open",
    created_at: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "gig-5",
    client_id: "client-demo-5",
    client_name: "FinTrack",
    title: "Integrate Payment API in Node.js Backend",
    description:
      "Implement invoice generation and webhook handling in an existing Express API. Need clean and tested code.",
    budget_min: 4000000,
    budget_max: 10000000,
    required_skills: ["nodejs", "typescript", "rest-api"],
    deadline: "2026-03-22",
    status: "open",
    created_at: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "gig-6",
    client_id: "client-demo-6",
    client_name: "PixelStudio",
    title: "Edit 20 Short-Form Reels",
    description:
      "Need video editor for Instagram and TikTok reels with captions, hooks, and quick transitions.",
    budget_min: 1800000,
    budget_max: 4200000,
    required_skills: ["video-editing", "capcut", "storytelling"],
    deadline: "2026-03-19",
    status: "open",
    created_at: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "gig-7",
    client_id: "client-demo-7",
    client_name: "TravelMate",
    title: "Build Admin Dashboard with Charts",
    description:
      "Create internal analytics dashboard using React. Includes filter controls and KPI visualizations.",
    budget_min: 3500000,
    budget_max: 8500000,
    required_skills: ["react", "typescript", "data-visualization"],
    deadline: "2026-03-21",
    status: "open",
    created_at: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "gig-8",
    client_id: "client-demo-8",
    client_name: "LocalMart",
    title: "Audit and Improve Website Core Web Vitals",
    description:
      "Need frontend performance optimization focused on LCP, CLS, and INP with practical implementation.",
    budget_min: 2500000,
    budget_max: 6000000,
    required_skills: ["web-performance", "nextjs", "lighthouse"],
    deadline: "2026-03-17",
    status: "open",
    created_at: "2026-03-02T00:00:00.000Z",
  },
];

writeJson("users.json", users);
writeJson("gigs.json", gigs);
writeJson("swipes.json", swipes);
writeJson("matches.json", matches);

console.log("Seeded data/*.json");
