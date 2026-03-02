# Lancerin - Design Document

**Date**: 2026-03-02
**Hackathon**: Mayar Vibecoding Competition 2026 (submit by Mar 15)
**Product**: Tinder for Freelance Gigs
**Tagline**: "Freelance it!" - Swipe to match on tech & digital gigs, AI-powered, Mayar-paid.

## 1. Product Overview

Lancerin is a swipe-based freelance gig matching platform. Freelancers browse tech & digital gigs by swiping right (interested) or left (pass). AI learns their preferences over time. When a client selects a freelancer, it's a match — and Mayar handles the entire payment flow.

**Core principle (via Tanay Kothari's playbook):**
- ONE behavior change: swipe instead of writing proposals
- Win on feelings, not features
- Build a product that learns the user

## 2. Target Users

**Primary (MVP focus): Freelancers**
- Looking for tech & digital gigs (web dev, design, copywriting, social media, video editing)
- Tired of writing proposals and competing on price
- Want discovery, not job boards

**Secondary: Clients/Businesses**
- Posting gigs and finding talent
- Simplified for MVP: post a gig form, browse interested freelancers, pick one

## 3. User Flow

### Freelancer
1. Sign up via Google
2. Onboarding: add skills, rate range (min-max IDR/hour), bio, portfolio URL
3. Enter swipe mode: browse gig cards
4. Swipe right = "I want this" / left = "pass"
5. AI learns from swipe patterns, improves feed
6. Client reviews interested freelancers, picks one = MATCH
7. Mayar invoice auto-created with gig budget
8. Freelancer delivers work
9. Client pays via Mayar invoice
10. Both sides review each other

### Client
1. Sign up via Google, select "I'm hiring"
2. Post a gig: title, description, budget, required skills, deadline
3. Browse freelancers who swiped right on your gig
4. Pick one = match created + Mayar invoice generated
5. Pay when work is delivered

## 4. Mayar Integration (7 touchpoints)

| # | Touchpoint | Mayar Feature | Description |
|---|-----------|---------------|-------------|
| 1 | User signup | Create Customer API | Every user becomes a Mayar customer |
| 2 | Match created | Create Invoice API | Auto-invoice with gig budget + freelancer info |
| 3 | Payment | Invoice payment link | Client pays via Mayar checkout (cards, bank transfer, QR) |
| 4 | Webhook | Payment webhook | Real-time payment status updates |
| 5 | Dashboard | Transaction APIs | Earnings/spending history pulled from Mayar |
| 6 | QR Pay | Dynamic QR Code API | Quick payment option |
| 7 | Credits | Credit-based system | Clients pre-load credits, spend per gig |

## 5. Tech Architecture

```
Next.js 15 (App Router) on Vercel
├── /data
│   ├── users.json ......... User profiles
│   ├── gigs.json .......... Pre-seeded gig listings
│   ├── swipes.json ........ Swipe records
│   └── matches.json ....... Match records
├── /app
│   ├── / .................. Landing page (user designs)
│   ├── /app/onboarding .... Profile setup wizard
│   ├── /app/swipe ......... Core swipe interface
│   ├── /app/matches ....... Match inbox + details
│   ├── /app/post-gig ...... Client: create gig form
│   ├── /app/dashboard ..... Earnings/spending (Mayar data)
│   └── /app/settings ...... Profile & preferences
├── /api
│   ├── /api/auth .......... NextAuth.js (Google only)
│   ├── /api/gigs .......... CRUD gig listings
│   ├── /api/swipes ........ Record swipe actions
│   ├── /api/matches ....... Matching logic + Mayar invoice creation
│   ├── /api/ai ............ MiniMax M2.5 via OpenRouter
│   └── /api/webhooks ...... Mayar payment webhooks
│
├── Auth: NextAuth.js ...... Google provider, JWT session
├── Mayar REST API ......... Payments, invoices, customers
├── Mayar MCP .............. AI-assisted payment queries
└── OpenRouter ............. MiniMax M2.5 for gig matching AI
```

### Stack
- **Framework**: Vinext (cloudflare/vinext — Next.js API on Vite)
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js (Google OAuth only)
- **Database**: JSON files (local, read/write via fs in API routes)
- **Payments**: Mayar REST API (production: api.mayar.id, sandbox: api.mayar.club)
- **AI**: OpenRouter → MiniMax M2.5 (gig matching & recommendations)
- **Animations**: Framer Motion (swipe card stack)
- **Icons**: Iconify Solar Linear Icons + Iconify SVG Logos Monotone (96x36 for company logos)
- **Design System**: Adobe Spectrum-inspired (8px grid, clean lines, numbered sections)
- **Deployment**: Node.js host (Railway/Render/Fly.io) via `vinext start`

## 6. Data Model (JSON files)

### users.json
```json
[{
  "id": "uuid",
  "email": "user@gmail.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "role": "freelancer",
  "skills": ["react", "nextjs", "typescript"],
  "hourly_rate_min": 100000,
  "hourly_rate_max": 300000,
  "bio": "Frontend dev with 3 years experience",
  "portfolio_url": "https://...",
  "mayar_customer_id": "mayar-cust-xxx",
  "created_at": "2026-03-02T00:00:00Z"
}]
```

### gigs.json
```json
[{
  "id": "uuid",
  "client_id": "user-uuid",
  "title": "Build Landing Page for SaaS Startup",
  "description": "Need a responsive landing page...",
  "budget_min": 500000,
  "budget_max": 1500000,
  "required_skills": ["react", "tailwind", "figma"],
  "deadline": "2026-03-20",
  "status": "open",
  "created_at": "2026-03-02T00:00:00Z"
}]
```

### swipes.json
```json
[{
  "id": "uuid",
  "user_id": "user-uuid",
  "gig_id": "gig-uuid",
  "direction": "right",
  "created_at": "2026-03-02T00:00:00Z"
}]
```

### matches.json
```json
[{
  "id": "uuid",
  "gig_id": "gig-uuid",
  "freelancer_id": "user-uuid",
  "status": "pending",
  "mayar_invoice_id": "inv-xxx",
  "mayar_invoice_url": "https://app.mayar.id/invoice/xxx",
  "paid_at": null,
  "created_at": "2026-03-02T00:00:00Z"
}]
```

## 7. AI Matching (MiniMax M2.5 via OpenRouter)

**Purpose**: Rank gigs for each freelancer based on profile fit and swipe patterns.

**How it works:**
1. Freelancer opens swipe view
2. API fetches their profile + swipe history + open gigs
3. Sends to MiniMax M2.5 via OpenRouter
4. Model returns ranked gig list with match scores (0-100)

**Prompt pattern:**
```
You are a gig matching AI for a freelance platform.

Freelancer profile:
- Skills: {skills}
- Rate range: {rate_min}-{rate_max} IDR/hour
- Recent swipe patterns: right-swiped gigs about {patterns}, skipped {patterns}

Available gigs:
{gigs_list}

Rank these gigs by relevance to this freelancer.
Return JSON: [{"gig_id": "...", "score": 85, "reason": "strong skill match"}]
```

## 8. Key UI Components

- **Swipe Card Stack**: Framer Motion animated cards showing gig title, budget range, required skills, client name, deadline
- **Match Celebration**: Full-screen animation when matched ("It's a Match!")
- **Match Detail**: Shows gig details + Mayar payment link + status
- **Dashboard**: Mayar-powered charts (earnings over time, pending payments)
- **Gig Post Form**: Simple form for clients (title, description, budget, skills, deadline)

## 9. MVP Scope (13 days)

### Must have
- [x] Google login
- [x] Freelancer onboarding (profile setup)
- [x] Swipe interface with card animations
- [x] AI-powered gig recommendations
- [x] Client gig posting
- [x] Match flow (freelancer swipes right + client picks = match)
- [x] Mayar invoice creation on match
- [x] Mayar payment link in match details
- [x] Payment webhook handling
- [x] Basic dashboard with Mayar transaction data
- [x] Pre-seeded demo gigs

### Nice to have
- [ ] Credit-based prepay system via Mayar
- [ ] Dynamic QR code payments
- [ ] Review/rating system
- [ ] Real-time notifications
- [ ] Chat between matched users
- [ ] Mayar MCP integration for AI-assisted payment queries

## 10. Hackathon Submission Checklist

Per Mayar Vibecoding Competition requirements:
- [ ] Live App / Prototype link
- [ ] App description
- [ ] AI tools & LLM used (Claude Code + MiniMax M2.5)
- [ ] "Vibecoding" process story
- [ ] Video demo (optional but recommended)
- [ ] Repository link (optional)
