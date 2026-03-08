# Lancerin

Swipe-based freelance gig matching app for the Mayar Vibecoding Competition 2026.

Freelancers swipe on gigs, clients pick from interested freelancers and set an agreed amount. Payment goes through Lancerin's platform via Mayar — once the client pays, the freelancer can start working.

## Stack

- Vinext (Next.js App Router on Vite)
- NextAuth (Google OAuth)
- Tailwind CSS v4 + Framer Motion
- JSON file storage (`data/*.json`)
- Mayar REST API (invoicing, customer management, transactions)
- OpenRouter MiniMax M2.5 for AI gig ranking

## Quick Start

1. Install deps:

```bash
npm install
```

1. Configure env:

```bash
cp .env.example .env.local
# fill actual keys in .env.local
```

1. Seed demo data:

```bash
npm run seed
```

1. Start dev server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - run vinext dev server
- `npm run build` - production build
- `npm run start` - run built app
- `npm run seed` - reset `data/*.json` demo data
- `npm run typecheck` - TypeScript validation
- `npm run lint` - ESLint

## Routes

- `/` landing page
- `/login` Google sign-in page
- `/app/onboarding` user setup
- `/app/post-gig` client gig posting
- `/app/swipe` freelancer swipe view
- `/app/matches` match inbox
- `/app/gig/[id]/interested` client picks freelancer
- `/app/dashboard` payment overview

## API Endpoints

- `GET/POST /api/users`
- `GET /api/users/me`
- `GET/POST /api/gigs`
- `GET /api/gigs/feed`
- `GET /api/gigs/[id]/interested`
- `GET/POST /api/swipes`
- `GET/POST /api/matches`
- `POST /api/webhooks/mayar`
- `GET /api/dashboard`

## Deployment

Docker build is included:

```bash
docker build -t lancerin .
docker run --rm -p 3000:3000 --env-file .env.local lancerin
```
