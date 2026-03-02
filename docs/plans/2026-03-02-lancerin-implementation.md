# Lancerin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a "Tinder for Freelance Gigs" web app with AI-powered matching and Mayar payment integration for the Mayar Vibecoding Competition 2026.

**Architecture:** Vinext (Next.js API on Vite) App Router monolith with JSON file storage, NextAuth.js (Google only), Mayar REST API for payments, and MiniMax M2.5 via OpenRouter for AI gig matching. Landing page is user-designed (boilerplate only). Core app lives under `/app` route group. Deploy via `vinext start` on a Node.js host (Railway/Render/Fly.io) — NOT `vinext deploy` to Workers (keeps filesystem access for JSON storage).

**Tech Stack:** Vinext (cloudflare/vinext), Tailwind CSS, NextAuth.js, Framer Motion, Mayar REST API (sandbox: api.mayar.club), OpenRouter (MiniMax M2.5)

**UI Design System:**
- **Icons:** Iconify Solar Linear Icons (`@iconify-json/solar`)
- **Company logos:** Iconify SVG Logos Monotone at 96x36 (`@iconify-json/logos`)
- **Design language:** Adobe Spectrum-inspired — clean lines, neutral palette, 8px grid
- **Layout details:** Vertical container-size lines as visual separators, numbered section labels (01, 02, 03)
- **No emojis.** Use Solar Linear icons for all UI elements.

**Design doc:** `docs/plans/2026-03-02-lancerin-design.md`

**Mayar API reference:** https://docs.mayar.id/llms.txt (full index of all endpoints)

**Vinext repo:** https://github.com/cloudflare/vinext (experimental, ~94% Next.js API coverage)

---

## Task 1: Project Scaffolding

**Files:**
- Create: `lancerin/` (Vinext project root)
- Create: `.env.local`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `vite.config.ts`

**Step 1: Create Next.js project then migrate to Vinext**

First scaffold a standard Next.js project, then migrate to Vinext:

```bash
cd /Users/dantezy/Downloads/PBA/hackathon
# Backup docs folder
cp -r lancerin/docs /tmp/lancerin-docs-backup

# Create fresh Next.js project
npx create-next-app@latest lancerin-tmp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

# Move contents into lancerin (preserve docs)
rm -rf lancerin/src lancerin/public lancerin/package.json lancerin/tsconfig.json
cp -r lancerin-tmp/* lancerin/
cp -r lancerin-tmp/.* lancerin/ 2>/dev/null || true
rm -rf lancerin-tmp

# Restore docs
cp -r /tmp/lancerin-docs-backup lancerin/docs

cd lancerin
```

Now migrate to Vinext:

```bash
# Install vinext
npm install vinext

# Update package.json scripts: replace "next" with "vinext"
# "dev": "vinext dev"
# "build": "vinext build"
# "start": "vinext start"
```

Create `vite.config.ts` in project root:
```typescript
import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig({
  plugins: [vinext()],
});
```

**Step 2: Install dependencies**

```bash
npm install next-auth framer-motion uuid @iconify/react
npm install -D @types/uuid @iconify-json/solar @iconify-json/logos
```

Note: `@iconify/react` gives us the `<Icon>` component. `@iconify-json/solar` provides Solar Linear icon data. `@iconify-json/logos` provides SVG Logos Monotone for company logos.

**Step 3: Create environment files**

`.env.local`:
```
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Mayar (Sandbox)
MAYAR_API_KEY=your-mayar-api-key
MAYAR_BASE_URL=https://api.mayar.club/hl/v1
MAYAR_REDIRECT_URL=http://localhost:3000/app/matches

# OpenRouter (MiniMax M2.5)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=minimax/minimax-m2.5
```

`.env.example` (same but with placeholder values, no secrets).

**Step 4: Verify project runs**

```bash
npm run dev
```

Open http://localhost:3000 — should see the default Next.js page.

**Step 5: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 15 project with deps"
```

---

## Task 2: TypeScript Types & Data Layer

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/db.ts`
- Create: `data/users.json`
- Create: `data/gigs.json`
- Create: `data/swipes.json`
- Create: `data/matches.json`

**Step 1: Define TypeScript interfaces**

`src/types/index.ts`:
```typescript
export type UserRole = "freelancer" | "client";
export type GigStatus = "open" | "matched" | "completed" | "closed";
export type SwipeDirection = "left" | "right";
export type MatchStatus = "pending" | "accepted" | "in_progress" | "completed";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: UserRole;
  skills: string[];
  hourly_rate_min: number;
  hourly_rate_max: number;
  bio: string;
  portfolio_url: string;
  mobile: string;
  mayar_customer_id: string | null;
  onboarded: boolean;
  created_at: string;
}

export interface Gig {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  required_skills: string[];
  deadline: string;
  status: GigStatus;
  created_at: string;
}

export interface Swipe {
  id: string;
  user_id: string;
  gig_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface Match {
  id: string;
  gig_id: string;
  freelancer_id: string;
  client_id: string;
  status: MatchStatus;
  mayar_invoice_id: string | null;
  mayar_invoice_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface MayarCustomerResponse {
  statusCode: number;
  messages: string;
  data: {
    name: string;
    email: string;
    mobile: string;
    userId: string;
    customerId: string;
  };
}

export interface MayarInvoiceResponse {
  statusCode: number;
  messages: string;
  data: {
    id: string;
    transactionId: string;
    link: string;
    expiredAt: number;
  };
}

export interface MayarTransactionsResponse {
  statusCode: number;
  messages: string;
  hasMore: boolean;
  pageCount: number;
  pageSize: number;
  page: number;
  data: MayarTransaction[];
}

export interface MayarTransaction {
  id: string;
  credit: number;
  status: string;
  balanceHistoryType: string;
  paymentMethod: string;
  customerId: string;
  createdAt: number;
  customer: {
    id: string;
    name: string;
    email: string;
    mobile: string;
  };
  paymentLink: {
    id: string;
    name: string;
  };
}

export interface AIMatchResult {
  gig_id: string;
  score: number;
  reason: string;
}
```

**Step 2: Build JSON file database utility**

`src/lib/db.ts`:
```typescript
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

export function readCollection<T>(collection: string): T[] {
  ensureDataDir();
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T[];
}

export function writeCollection<T>(collection: string, data: T[]): void {
  ensureDataDir();
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function findById<T extends { id: string }>(
  collection: string,
  id: string
): T | undefined {
  const items = readCollection<T>(collection);
  return items.find((item) => item.id === id);
}

export function findByField<T>(
  collection: string,
  field: keyof T,
  value: unknown
): T[] {
  const items = readCollection<T>(collection);
  return items.filter((item) => item[field] === value);
}

export function insertOne<T extends { id: string }>(
  collection: string,
  item: T
): T {
  const items = readCollection<T>(collection);
  items.push(item);
  writeCollection(collection, items);
  return item;
}

export function updateOne<T extends { id: string }>(
  collection: string,
  id: string,
  updates: Partial<T>
): T | null {
  const items = readCollection<T>(collection);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  writeCollection(collection, items);
  return items[index];
}
```

**Step 3: Create empty JSON data files**

Create `data/users.json`, `data/gigs.json`, `data/swipes.json`, `data/matches.json` — each containing `[]`.

**Step 4: Commit**

```bash
git add src/types/index.ts src/lib/db.ts data/
git commit -m "feat: add TypeScript types and JSON file database layer"
```

---

## Task 3: Seed Demo Gigs

**Files:**
- Create: `scripts/seed.ts`
- Modify: `data/gigs.json`

**Step 1: Create seed script with realistic Indonesian tech gigs**

`scripts/seed.ts`:
```typescript
import { writeFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";

const demoClientId = "demo-client-001";

const gigs = [
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "TechStartup.id",
    title: "Build Landing Page for SaaS Startup",
    description: "We need a modern, responsive landing page for our new B2B SaaS product. Must include hero section, features grid, pricing table, and contact form. Figma design provided.",
    budget_min: 2000000,
    budget_max: 5000000,
    required_skills: ["react", "nextjs", "tailwind", "figma"],
    deadline: "2026-03-20",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "Warung Digital",
    title: "Design Mobile App UI for Food Delivery",
    description: "Need complete UI/UX design for a food delivery app targeting Indonesian market. 15-20 screens including onboarding, menu browsing, cart, checkout, and order tracking.",
    budget_min: 3000000,
    budget_max: 7000000,
    required_skills: ["figma", "ui-design", "mobile-design"],
    deadline: "2026-03-25",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "EduTech Nusantara",
    title: "Create Social Media Content for EdTech Launch",
    description: "We are launching an online learning platform and need 30 social media posts (Instagram + Twitter) for the first month. Must understand Indonesian education market.",
    budget_min: 1500000,
    budget_max: 3000000,
    required_skills: ["copywriting", "social-media", "canva", "content-strategy"],
    deadline: "2026-03-15",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "KriptoKita",
    title: "Build REST API for Crypto Portfolio Tracker",
    description: "Backend API for a crypto portfolio tracking app. Endpoints for portfolio CRUD, price fetching from CoinGecko, P&L calculation, and webhook alerts. Node.js + PostgreSQL preferred.",
    budget_min: 5000000,
    budget_max: 10000000,
    required_skills: ["nodejs", "typescript", "postgresql", "rest-api"],
    deadline: "2026-04-01",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "BrandLokal",
    title: "Logo and Brand Identity for Fashion Brand",
    description: "New Indonesian streetwear brand needs full brand identity: logo, color palette, typography, brand guidelines document. Modern, clean, Jakarta street culture inspired.",
    budget_min: 2500000,
    budget_max: 5000000,
    required_skills: ["logo-design", "branding", "illustrator", "photoshop"],
    deadline: "2026-03-18",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "AutomateID",
    title: "Write Technical Blog Posts on AI/ML",
    description: "Need 8 technical blog posts (1500-2000 words each) about practical AI/ML applications for Indonesian businesses. Topics: chatbots, computer vision, NLP for Bahasa Indonesia, etc.",
    budget_min: 4000000,
    budget_max: 6000000,
    required_skills: ["technical-writing", "ai-ml", "content-writing", "seo"],
    deadline: "2026-04-05",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "TokoOnline Pro",
    title: "Shopify Store Setup and Customization",
    description: "Set up a Shopify store for an Indonesian fashion retailer. Need theme customization, product upload (50 products), payment gateway integration, and shipping setup for JNE/J&T.",
    budget_min: 3000000,
    budget_max: 6000000,
    required_skills: ["shopify", "ecommerce", "html-css", "liquid"],
    deadline: "2026-03-22",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "GameDev Indo",
    title: "Create Promotional Video for Mobile Game",
    description: "30-second promotional video for App Store and Google Play. Gameplay footage editing, motion graphics, sound design. Must feel energetic and appeal to Gen Z Indonesian gamers.",
    budget_min: 2000000,
    budget_max: 4500000,
    required_skills: ["video-editing", "after-effects", "motion-graphics", "premiere-pro"],
    deadline: "2026-03-17",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "HealthApp.co",
    title: "Flutter App Bug Fixes and Feature Addition",
    description: "Existing Flutter health tracking app needs 5 bug fixes and 2 new features: medication reminders and doctor appointment booking. Backend is Firebase.",
    budget_min: 4000000,
    budget_max: 8000000,
    required_skills: ["flutter", "dart", "firebase", "mobile-development"],
    deadline: "2026-03-28",
    status: "open",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    client_id: demoClientId,
    client_name: "DataPulse Analytics",
    title: "Build Dashboard with Data Visualization",
    description: "Interactive analytics dashboard showing sales metrics, user engagement, and revenue trends. Must support date range filtering, CSV export, and real-time updates.",
    budget_min: 5000000,
    budget_max: 9000000,
    required_skills: ["react", "d3js", "typescript", "data-visualization"],
    deadline: "2026-04-03",
    status: "open",
    created_at: new Date().toISOString(),
  },
];

writeFileSync("data/gigs.json", JSON.stringify(gigs, null, 2));
console.log(`Seeded ${gigs.length} demo gigs`);
```

**Step 2: Run the seed script**

```bash
npx tsx scripts/seed.ts
```

**Step 3: Commit**

```bash
git add scripts/seed.ts data/gigs.json
git commit -m "feat: add seed script with 10 demo gigs"
```

---

## Task 4: Authentication (NextAuth.js + Google)

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth.ts`
- Create: `src/components/providers.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Configure NextAuth.js**

`src/lib/auth.ts`:
```typescript
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
```

**Step 2: Create the NextAuth route handler**

`src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Step 3: Create session provider wrapper**

`src/components/providers.tsx`:
```typescript
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**Step 4: Wrap root layout with providers**

Modify `src/app/layout.tsx` — wrap `{children}` with `<Providers>`.

**Step 5: Create login page**

Create `src/app/login/page.tsx` with a Google sign-in button using `signIn("google")` from `next-auth/react`.

**Step 6: Verify auth flow works**

```bash
npm run dev
```

Visit http://localhost:3000/login — Google sign-in button should appear. (Full OAuth flow requires valid Google credentials in `.env.local`)

**Step 7: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/components/providers.tsx src/app/layout.tsx src/app/login/
git commit -m "feat(auth): add NextAuth.js with Google OAuth"
```

---

## Task 5: Mayar API Client

**Files:**
- Create: `src/lib/mayar.ts`

**Step 1: Build the Mayar API client**

`src/lib/mayar.ts`:
```typescript
import type {
  MayarCustomerResponse,
  MayarInvoiceResponse,
  MayarTransactionsResponse,
} from "@/types";

const BASE_URL = process.env.MAYAR_BASE_URL || "https://api.mayar.club/hl/v1";
const API_KEY = process.env.MAYAR_API_KEY || "";

async function mayarFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Mayar API error (${res.status}): ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

export async function createCustomer(
  name: string,
  email: string,
  mobile: string
): Promise<MayarCustomerResponse> {
  return mayarFetch<MayarCustomerResponse>("/customer/create", {
    method: "POST",
    body: JSON.stringify({ name, email, mobile }),
  });
}

export async function createInvoice(params: {
  name: string;
  email: string;
  mobile: string;
  redirectUrl: string;
  description: string;
  expiredAt: string; // ISO 8601
  items: Array<{ quantity: number; rate: number; description: string }>;
  extraData?: Record<string, string>;
}): Promise<MayarInvoiceResponse> {
  return mayarFetch<MayarInvoiceResponse>("/invoice/create", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getTransactions(
  page: number = 1,
  pageSize: number = 10
): Promise<MayarTransactionsResponse> {
  return mayarFetch<MayarTransactionsResponse>(
    `/transactions?page=${page}&pageSize=${pageSize}`,
    { method: "GET" }
  );
}

export async function getAccountBalance(): Promise<{
  statusCode: number;
  data: { balance: number };
}> {
  return mayarFetch("/transaction/balance", { method: "GET" });
}

export async function registerWebhook(
  urlHook: string
): Promise<{ statusCode: number; messages: string }> {
  return mayarFetch("/webhook/register", {
    method: "GET",
    body: JSON.stringify({ urlHook }),
  });
}
```

**Step 2: Commit**

```bash
git add src/lib/mayar.ts
git commit -m "feat: add Mayar API client (customer, invoice, transactions)"
```

---

## Task 6: App Layout & Navigation

**Files:**
- Create: `src/app/app/layout.tsx`
- Create: `src/components/app-sidebar.tsx`
- Create: `src/components/user-menu.tsx`

**Step 1: Create the /app route group layout**

This is the authenticated app shell. It includes a sidebar with navigation links (Swipe, Matches, Post Gig, Dashboard, Settings) and a user avatar menu.

`src/app/app/layout.tsx`:
```typescript
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar user={session.user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

**Step 2: Build the sidebar component**

`src/components/app-sidebar.tsx` — Navigation with icons for: Swipe (the main view), Matches, Post Gig, Dashboard, Settings. Use simple SVG icons or text labels. Highlight active route.

**Step 3: Build user menu component**

`src/components/user-menu.tsx` — Shows user avatar + name from session, sign-out button.

**Step 4: Create placeholder pages**

Create these files, each with a simple heading:
- `src/app/app/page.tsx` — redirects to `/app/swipe`
- `src/app/app/swipe/page.tsx` — "Swipe"
- `src/app/app/matches/page.tsx` — "Matches"
- `src/app/app/post-gig/page.tsx` — "Post Gig"
- `src/app/app/dashboard/page.tsx` — "Dashboard"
- `src/app/app/settings/page.tsx` — "Settings"
- `src/app/app/onboarding/page.tsx` — "Onboarding"

**Step 5: Verify navigation works**

```bash
npm run dev
```

Visit http://localhost:3000/app — should redirect to login if not authenticated, show sidebar if authenticated.

**Step 6: Commit**

```bash
git add src/app/app/ src/components/app-sidebar.tsx src/components/user-menu.tsx
git commit -m "feat: add app layout with sidebar navigation and placeholder pages"
```

---

## Task 7: User Onboarding Flow

**Files:**
- Create: `src/app/app/onboarding/page.tsx`
- Create: `src/app/api/users/route.ts`
- Create: `src/app/api/users/me/route.ts`

**Step 1: Create user API routes**

`src/app/api/users/route.ts` — POST: Create/update user profile. Reads session, creates user in `users.json` with role, skills, rates, bio. Also calls Mayar `createCustomer` API to register the user as a Mayar customer.

`src/app/api/users/me/route.ts` — GET: Returns current user's profile from `users.json` by matching session email.

**Step 2: Build onboarding page**

`src/app/app/onboarding/page.tsx` — Client component with a multi-step form:
1. **Step 1: Role selection** — "I'm looking for gigs" (freelancer) or "I'm hiring" (client)
2. **Step 2: Profile details** — Name, bio, portfolio URL, phone number
3. **Step 3 (freelancer only): Skills & rates** — Multi-select skill tags from a predefined list, hourly rate range (min/max in IDR)
4. **Submit** → POST to `/api/users` → redirect to `/app/swipe` (freelancer) or `/app/post-gig` (client)

Predefined skills list:
```typescript
const SKILLS = [
  "react", "nextjs", "typescript", "javascript", "nodejs",
  "python", "flutter", "dart", "figma", "ui-design",
  "mobile-design", "logo-design", "branding", "illustrator",
  "photoshop", "copywriting", "content-writing", "seo",
  "technical-writing", "social-media", "content-strategy",
  "video-editing", "after-effects", "motion-graphics",
  "premiere-pro", "shopify", "ecommerce", "html-css",
  "postgresql", "rest-api", "firebase", "d3js",
  "data-visualization", "ai-ml", "canva", "liquid",
  "mobile-development", "tailwind"
];
```

**Step 3: Add onboarding guard to app layout**

In `src/app/app/layout.tsx`, after session check: look up user in `users.json` by email. If not found or `onboarded === false`, redirect to `/app/onboarding`.

**Step 4: Verify onboarding flow**

```bash
npm run dev
```

Login → should redirect to onboarding → fill form → submit → should redirect to swipe/post-gig.

**Step 5: Commit**

```bash
git add src/app/app/onboarding/ src/app/api/users/
git commit -m "feat: add user onboarding flow with Mayar customer creation"
```

---

## Task 8: Gig Posting (Client Side)

**Files:**
- Create: `src/app/app/post-gig/page.tsx`
- Create: `src/app/api/gigs/route.ts`

**Step 1: Create gig API route**

`src/app/api/gigs/route.ts`:
- **GET**: Returns all open gigs (optionally filtered by `client_id` query param)
- **POST**: Creates a new gig. Reads session to get `client_id`. Requires: `title`, `description`, `budget_min`, `budget_max`, `required_skills[]`, `deadline`. Generates UUID, sets `status: "open"`, saves to `gigs.json`.

**Step 2: Build gig posting form**

`src/app/app/post-gig/page.tsx` — Client component with form fields:
- Title (text input)
- Description (textarea)
- Budget range (two number inputs: min/max in IDR)
- Required skills (multi-select from same SKILLS list as onboarding)
- Deadline (date picker)
- Submit button → POST to `/api/gigs`

After successful submit, show a success message with the gig details and a link to view interested freelancers.

Also show a list of the client's previously posted gigs below the form.

**Step 3: Commit**

```bash
git add src/app/app/post-gig/ src/app/api/gigs/
git commit -m "feat: add gig posting form and API"
```

---

## Task 9: Swipe Interface (Core Feature)

**Files:**
- Create: `src/app/app/swipe/page.tsx`
- Create: `src/components/swipe-card.tsx`
- Create: `src/components/swipe-stack.tsx`
- Create: `src/app/api/swipes/route.ts`
- Create: `src/app/api/gigs/feed/route.ts`

**Step 1: Create the feed API route**

`src/app/api/gigs/feed/route.ts` — GET: Returns gigs for the current freelancer to swipe on.
1. Get current user from session
2. Get all gigs with `status: "open"`
3. Get all swipes by this user
4. Filter out gigs the user already swiped on
5. Return remaining gigs (AI ranking added in Task 10)

**Step 2: Create the swipe recording API**

`src/app/api/swipes/route.ts`:
- **POST**: Records a swipe. Body: `{ gig_id, direction }`. Creates swipe entry in `swipes.json` with user ID from session.
- **GET**: Returns all swipes for the current user (used for AI matching context).

**Step 3: Build the SwipeCard component**

`src/components/swipe-card.tsx` — A card that shows:
- Gig title (large)
- Client name
- Budget range (formatted as "Rp 2.000.000 - Rp 5.000.000")
- Required skills (as colored tags/chips)
- Deadline
- First 2 lines of description
- Tap to expand (shows full description)

Style: rounded card with shadow, white background. Skill tags use distinct colors.

**Step 4: Build the SwipeStack component**

`src/components/swipe-stack.tsx` — The main swipe interaction using Framer Motion:
- Stack of cards (show top 3, slightly offset behind each other)
- Drag gesture: drag left = reject, drag right = interested
- Visual feedback: green overlay + checkmark when dragging right, red overlay + X when dragging left
- On release past threshold: animate card off-screen, call POST `/api/swipes`, show next card
- Buttons below the stack: X (left) and Heart (right) for non-drag interaction
- Empty state: "No more gigs! Check back later." when all gigs are swiped

Use `framer-motion` `motion.div` with `drag="x"` prop, `onDragEnd` handler, and `animate` for card exit.

**Step 5: Build the swipe page**

`src/app/app/swipe/page.tsx` — Fetches gigs from `/api/gigs/feed`, renders `<SwipeStack>`. Shows a count of remaining gigs.

**Step 6: Verify swipe works**

```bash
npm run dev
```

Login as freelancer → navigate to swipe → should see gig cards → drag or tap to swipe → cards should animate and record swipes.

**Step 7: Commit**

```bash
git add src/app/app/swipe/ src/components/swipe-card.tsx src/components/swipe-stack.tsx src/app/api/swipes/ src/app/api/gigs/feed/
git commit -m "feat: add swipe interface with Framer Motion card stack"
```

---

## Task 10: AI-Powered Gig Matching

**Files:**
- Create: `src/lib/ai.ts`
- Modify: `src/app/api/gigs/feed/route.ts`

**Step 1: Build the OpenRouter / MiniMax client**

`src/lib/ai.ts`:
```typescript
import type { AIMatchResult, Gig, User, Swipe } from "@/types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const MODEL = process.env.OPENROUTER_MODEL || "minimax/minimax-m2.5";

export async function rankGigsForUser(
  user: User,
  gigs: Gig[],
  swipeHistory: Swipe[]
): Promise<AIMatchResult[]> {
  // Analyze swipe patterns
  const rightSwipedGigIds = swipeHistory
    .filter((s) => s.direction === "right")
    .map((s) => s.gig_id);

  // Build context from right-swiped gigs (what the user liked)
  const likedPatterns = gigs
    .filter((g) => rightSwipedGigIds.includes(g.id))
    .map((g) => g.required_skills.join(", "))
    .join("; ");

  const prompt = `You are a gig matching AI for Lancerin, a freelance gig platform.

Freelancer profile:
- Name: ${user.name}
- Skills: ${user.skills.join(", ")}
- Rate range: Rp ${user.hourly_rate_min.toLocaleString()} - Rp ${user.hourly_rate_max.toLocaleString()} per hour
- Bio: ${user.bio}
${likedPatterns ? `- Previously liked gigs with skills: ${likedPatterns}` : "- No swipe history yet"}

Available gigs to rank:
${gigs.map((g, i) => `${i + 1}. [ID: ${g.id}] "${g.title}" - Skills: ${g.required_skills.join(", ")} - Budget: Rp ${g.budget_min.toLocaleString()}-${g.budget_max.toLocaleString()}`).join("\n")}

Rank these gigs by relevance to this freelancer. Consider:
1. Skill overlap between freelancer and gig requirements
2. Budget alignment with their rate range
3. Patterns from their swipe history (if available)

Return ONLY a JSON array, no other text:
[{"gig_id": "...", "score": 85, "reason": "short reason"}]

Order by score descending (best match first).`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      console.error("OpenRouter error:", await res.text());
      return gigs.map((g) => ({ gig_id: g.id, score: 50, reason: "default" }));
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return gigs.map((g) => ({ gig_id: g.id, score: 50, reason: "default" }));
    }

    return JSON.parse(jsonMatch[0]) as AIMatchResult[];
  } catch (error) {
    console.error("AI matching error:", error);
    // Fallback: return gigs in original order with default scores
    return gigs.map((g) => ({ gig_id: g.id, score: 50, reason: "default" }));
  }
}
```

**Step 2: Integrate AI ranking into the feed API**

Modify `src/app/api/gigs/feed/route.ts`:
- After filtering out already-swiped gigs, call `rankGigsForUser()`
- Sort gigs by the AI scores (highest first)
- Return the sorted gigs with their AI match scores and reasons
- Include a `ai_score` and `ai_reason` field in each gig response

**Step 3: Show AI match score on swipe cards**

Modify `src/components/swipe-card.tsx` — Add a match percentage badge (e.g., "92% Match") on the top-right of each card with the AI reason shown on card expand.

**Step 4: Commit**

```bash
git add src/lib/ai.ts src/app/api/gigs/feed/
git commit -m "feat: add AI-powered gig matching via MiniMax M2.5"
```

---

## Task 11: Match Flow & Mayar Invoice

**Files:**
- Create: `src/app/api/matches/route.ts`
- Create: `src/app/app/matches/page.tsx`
- Create: `src/components/match-card.tsx`
- Create: `src/app/app/gig/[id]/interested/page.tsx`

**Step 1: Create match API**

`src/app/api/matches/route.ts`:
- **GET**: Returns matches for the current user (as freelancer OR as client)
- **POST**: Creates a match. Body: `{ gig_id, freelancer_id }`. Only callable by the client who owns the gig.
  1. Verify the client owns the gig
  2. Verify the freelancer swiped right on this gig
  3. Create a Mayar invoice via `createInvoice()`:
     - `name`: client's name
     - `email`: client's email
     - `mobile`: client's phone
     - `redirectUrl`: `MAYAR_REDIRECT_URL` env var (back to matches page)
     - `description`: `"Lancerin Gig Payment: {gig title}"`
     - `expiredAt`: gig deadline (ISO 8601)
     - `items`: `[{ quantity: 1, rate: gig.budget_max, description: gig.title }]`
     - `extraData`: `{ matchId: match.id, gigId: gig.id }`
  4. Save match to `matches.json` with `mayar_invoice_id` and `mayar_invoice_url` from response
  5. Update gig status to `"matched"`

**Step 2: Create "interested freelancers" page for clients**

`src/app/app/gig/[id]/interested/page.tsx`:
- Fetches all right-swipes for this gig from `swipes.json`
- Looks up each freelancer's profile from `users.json`
- Shows a list of freelancer cards (name, skills, rate, bio, avatar)
- Each card has a "Pick This Freelancer" button → POST `/api/matches`
- On success, shows "It's a Match!" celebration with the Mayar invoice link

**Step 3: Build matches page (freelancer view)**

`src/app/app/matches/page.tsx`:
- Fetches matches for the current user from `/api/matches`
- Shows match cards with: gig title, client name, match status, payment status
- If `mayar_invoice_url` exists, show a "Pay" button (for client view) or "Payment Pending" status (for freelancer view)
- Color-coded status: pending (yellow), paid (green), completed (blue)

**Step 4: Build match card component**

`src/components/match-card.tsx` — Reusable card showing match details, payment link, and status badge.

**Step 5: Commit**

```bash
git add src/app/api/matches/ src/app/app/matches/ src/app/app/gig/ src/components/match-card.tsx
git commit -m "feat: add match flow with Mayar invoice creation"
```

---

## Task 12: Mayar Webhook Handler

**Files:**
- Create: `src/app/api/webhooks/mayar/route.ts`

**Step 1: Create webhook endpoint**

`src/app/api/webhooks/mayar/route.ts` — POST handler:
1. Parse the incoming webhook payload from Mayar
2. Look for transaction/payment completion signals
3. Find the match by `extraData.matchId` or by `invoice_id`
4. Update the match in `matches.json`: set `paid_at` to current timestamp, set `status` to `"in_progress"`
5. Return 200 OK

Note: Mayar webhook payload structure may vary. Log the full payload on first receipt to understand the format. For MVP, a best-effort handler is fine.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/db";
import type { Match } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("Mayar webhook received:", JSON.stringify(payload, null, 2));

    // Try to extract match info from the webhook
    const invoiceId = payload?.data?.id || payload?.data?.transactionId;
    const extraData = payload?.data?.extraData;
    const matchId = extraData?.matchId;

    if (matchId || invoiceId) {
      const matches = readCollection<Match>("matches");
      const index = matches.findIndex(
        (m) => m.id === matchId || m.mayar_invoice_id === invoiceId
      );

      if (index !== -1) {
        matches[index].paid_at = new Date().toISOString();
        matches[index].status = "in_progress";
        writeCollection("matches", matches);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/webhooks/
git commit -m "feat: add Mayar payment webhook handler"
```

---

## Task 13: Dashboard (Mayar Transactions)

**Files:**
- Create: `src/app/app/dashboard/page.tsx`
- Create: `src/app/api/dashboard/route.ts`

**Step 1: Create dashboard API**

`src/app/api/dashboard/route.ts` — GET:
1. Get current user from session
2. Fetch their matches from `matches.json`
3. Call Mayar `getTransactions()` to get real payment data
4. Return combined data: total earnings, pending payments, completed gigs, recent transactions

**Step 2: Build dashboard page**

`src/app/app/dashboard/page.tsx`:
- **Stats cards** at the top: Total Earnings (from Mayar), Pending Payments, Completed Gigs, Active Matches
- **Recent transactions** table: date, gig title, amount, payment method, status
- **Match history** list: all matches with their payment status

Format currency in IDR: `Rp 5.000.000` using `Intl.NumberFormat("id-ID")`.

**Step 3: Commit**

```bash
git add src/app/app/dashboard/ src/app/api/dashboard/
git commit -m "feat: add dashboard with Mayar transaction data"
```

---

## Task 14: Landing Page Boilerplate

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Create landing page boilerplate**

The user will design this themselves. Provide a clean starter with:
- Hero section placeholder ("Lancerin — Freelance it!")
- Brief value proposition placeholder
- "Get Started" CTA button → links to `/login`
- Simple footer

Keep it minimal — the user will replace the design.

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing page boilerplate"
```

---

## Task 15: Polish & Integration Testing

**Files:**
- Modify: various files for bug fixes and polish

**Step 1: Test the complete flow end-to-end**

1. Start the dev server: `npm run dev`
2. Visit landing page → click "Get Started" → Google login
3. Complete onboarding as a freelancer
4. Navigate to swipe → swipe through gigs
5. Open a second browser (or incognito) → login as a different Google account → onboard as client
6. Post a new gig
7. Switch back to freelancer → swipe right on the new gig
8. Switch to client → view interested freelancers → pick one → verify Mayar invoice is created
9. Check the Mayar sandbox dashboard to confirm the invoice exists
10. Visit the Mayar payment link → complete payment (sandbox)
11. Verify webhook fires → match status updates
12. Check dashboard → verify transaction appears

**Step 2: Fix any issues found during testing**

Address bugs, UI issues, and broken flows.

**Step 3: Add responsive design**

Ensure the swipe interface works well on mobile viewports (375px - 428px wide). The swipe cards should be full-width on mobile.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: polish UI and fix integration issues"
```

---

## Task 16: Deployment & Submission

**Files:**
- Create: `Dockerfile` or deploy config (depending on host)

**Step 1: Deploy to a Node.js host (Railway/Render/Fly.io)**

Since we use `vinext start` (pure Node.js HTTP server), JSON file storage works. Do NOT use `vinext deploy` (Cloudflare Workers, no filesystem).

**Option A: Railway (recommended for speed)**
```bash
# Railway auto-detects Node.js projects
npm install -g @railway/cli
railway login
railway init
railway up
```

**Option B: Render**
- Connect GitHub repo → select "Web Service" → build command: `npm run build` → start command: `npm run start`

**Option C: Fly.io**
```bash
fly launch
fly deploy
```

Set environment variables on whichever host:
- `NEXTAUTH_URL` → your deployed URL
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MAYAR_API_KEY`
- `MAYAR_BASE_URL` → `https://api.mayar.club/hl/v1` (sandbox) or production
- `MAYAR_REDIRECT_URL` → your deployed URL + `/app/matches`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` → `minimax/minimax-m2.5`

**Note on persistence:** JSON files are writable on Node.js hosts with persistent disk. On ephemeral hosts (like Railway free tier), data resets on redeploy. For the hackathon demo this is fine — seed data loads on first request.

**Step 2: Register Mayar webhook**

After deployment, register the webhook URL:
```bash
curl -X GET "https://api.mayar.club/hl/v1/webhook/register" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"urlHook": "https://your-app.vercel.app/api/webhooks/mayar"}'
```

**Step 3: Record demo video (optional but recommended)**

Show the full flow: landing → login → onboard → swipe → match → Mayar payment → dashboard.

**Step 4: Submit to hackathon**

Go to https://mayar.id/vibe2026 and fill the form:
- App name: Lancerin
- Description: "Tinder for Freelance Gigs — swipe-based gig matching with AI recommendations and Mayar payment integration"
- AI tools: Claude Code (vibecoding), MiniMax M2.5 via OpenRouter (AI matching)
- Live app link: your Vercel URL
- Video demo link (if recorded)
- Repository link (if public)

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: prepare for hackathon submission"
```

---

## Dependency Graph

```
Task 1 (scaffold) ──────────────────────────────────────────────┐
Task 2 (types + db) ─── depends on: Task 1                     │
Task 3 (seed data) ──── depends on: Task 2                     │
Task 4 (auth) ────────── depends on: Task 1                    │
Task 5 (mayar client) ── depends on: Task 2                    │
Task 6 (layout) ──────── depends on: Task 4                    ├─ Wave 1: Tasks 1
Task 7 (onboarding) ──── depends on: Task 5, Task 6           ├─ Wave 2: Tasks 2, 4, 5
Task 8 (gig posting) ─── depends on: Task 6, Task 2           ├─ Wave 3: Tasks 3, 6
Task 9 (swipe) ────────── depends on: Task 3, Task 6          ├─ Wave 4: Tasks 7, 8, 9
Task 10 (AI matching) ── depends on: Task 9                    ├─ Wave 5: Task 10
Task 11 (match flow) ─── depends on: Task 5, Task 9           ├─ Wave 6: Tasks 11, 12, 13
Task 12 (webhook) ────── depends on: Task 5                    ├─ Wave 7: Task 14
Task 13 (dashboard) ──── depends on: Task 5, Task 11          ├─ Wave 8: Tasks 15, 16
Task 14 (landing) ────── depends on: Task 1                    │
Task 15 (polish) ─────── depends on: ALL above                 │
Task 16 (deploy) ─────── depends on: Task 15                   ┘
```

## Parallelization Opportunities

Tasks that can run in parallel (same wave):
- **Wave 2**: Tasks 2, 4, 5 (types/db, auth, mayar client — independent)
- **Wave 4**: Tasks 7, 8, 9 (onboarding, gig posting, swipe — independent pages)
- **Wave 6**: Tasks 11, 12, 13 (match flow, webhook, dashboard — different API domains)
