# Lancerin Team-Span Execution Plan (`/do`)

**Date**: 2026-03-02  
**Scope**: Convert existing implementation plan into a team-executable dependency graph and wave schedule.  
**Sources**: `docs/plans/2026-03-02-lancerin-design.md`, `docs/plans/2026-03-02-lancerin-implementation.md`

## Skill Routing

- Skill used: `do`
- Why: request is planning + dependency/wave orchestration across a team.

## Team Topology

- `lead` (coordinator): sequencing, merge control, quality gates, unblock decisions.
- `backend-a`: types, DB JSON layer, auth APIs, user/gig/match APIs.
- `frontend-a`: app layout, onboarding UI, post-gig UI, swipe/matches/dashboard pages.
- `integrations-a`: Mayar client, OpenRouter ranking client, webhook, deployment wiring.
- `qa-a`: integration/E2E test passes, regression checks, release checklist.

## Normalized Task Graph (with `depends_on`)

```json
[
  { "id": "t01-scaffold", "description": "Scaffold Vinext app + env setup", "depends_on": [], "layer": "infra" },
  { "id": "t02-types-db", "description": "Define TS types + JSON DB helpers", "depends_on": ["t01-scaffold"], "layer": "backend" },
  { "id": "t03-seed-data", "description": "Seed demo gigs/users/swipes data", "depends_on": ["t02-types-db"], "layer": "backend" },
  { "id": "t04-auth", "description": "Implement NextAuth Google flow", "depends_on": ["t01-scaffold", "t02-types-db"], "layer": "backend" },
  { "id": "t05-mayar-client", "description": "Implement Mayar REST client", "depends_on": ["t02-types-db"], "layer": "backend" },
  { "id": "t06-app-layout", "description": "Build /app shell layout + sidebar/nav", "depends_on": ["t04-auth"], "layer": "frontend" },
  { "id": "t07-onboarding", "description": "Onboarding API + onboarding page", "depends_on": ["t02-types-db", "t04-auth", "t06-app-layout"], "layer": "fullstack" },
  { "id": "t08-gig-posting", "description": "Gig posting API + client form page", "depends_on": ["t02-types-db", "t04-auth", "t06-app-layout"], "layer": "fullstack" },
  { "id": "t09-swipe-core", "description": "Feed/swipe APIs + SwipeStack UI", "depends_on": ["t02-types-db", "t03-seed-data", "t04-auth", "t06-app-layout"], "layer": "fullstack" },
  { "id": "t10-ai-ranking", "description": "OpenRouter ranking + feed integration", "depends_on": ["t09-swipe-core"], "layer": "backend" },
  { "id": "t11-match-invoice", "description": "Match flow + Mayar invoice creation + matches UI", "depends_on": ["t05-mayar-client", "t08-gig-posting", "t09-swipe-core"], "layer": "fullstack" },
  { "id": "t12-mayar-webhook", "description": "Payment webhook updates match state", "depends_on": ["t05-mayar-client", "t11-match-invoice"], "layer": "backend" },
  { "id": "t13-dashboard", "description": "Dashboard API + dashboard page", "depends_on": ["t05-mayar-client", "t11-match-invoice"], "layer": "fullstack" },
  { "id": "t14-landing", "description": "Landing page boilerplate", "depends_on": ["t01-scaffold"], "layer": "frontend" },
  { "id": "t15-polish-test", "description": "Cross-flow bugfix + responsive + integration checks", "depends_on": ["t07-onboarding", "t08-gig-posting", "t10-ai-ranking", "t11-match-invoice", "t12-mayar-webhook", "t13-dashboard", "t14-landing"], "layer": "test" },
  { "id": "t16-deploy-submit", "description": "Deploy + webhook register + submission prep", "depends_on": ["t15-polish-test"], "layer": "infra" }
]
```

## Wave Resolution

- Wave 1: `t01-scaffold`
- Wave 2: `t02-types-db`, `t14-landing`
- Wave 3: `t03-seed-data`, `t04-auth`, `t05-mayar-client`
- Wave 4: `t06-app-layout`
- Wave 5: `t07-onboarding`, `t08-gig-posting`, `t09-swipe-core`
- Wave 6: `t10-ai-ranking`, `t11-match-invoice`
- Wave 7: `t12-mayar-webhook`, `t13-dashboard`
- Wave 8: `t15-polish-test`
- Wave 9: `t16-deploy-submit`

## Dispatch Mode Per Wave

- Wave 1: sequential lead + `backend-a` (bootstrap risk is high if parallelized).
- Wave 2: parallel sub-agent tasks (`backend-a` + `frontend-a`), no file overlap.
- Wave 3: parallel sub-agent tasks (3 backend/integration tasks, separate files).
- Wave 4: sequential (`frontend-a`) to stabilize shell before feature pages.
- Wave 5: real team wave (3 substantial cross-domain tasks, no write overlap allowed).
- Wave 6: parallel sub-agent tasks (`integrations-a` + `backend-a/frontend-a` pairing).
- Wave 7: parallel sub-agent tasks (`integrations-a` + `frontend-a`).
- Wave 8: sequential hardening by `qa-a` with support from feature owners.
- Wave 9: sequential release checklist by lead + `integrations-a`.

## File Ownership Guardrails (Conflict Prevention)

- `src/types/index.ts` and `src/lib/db.ts` are single-writer in Waves 2-3 (`backend-a` only).
- `src/lib/mayar.ts` and `src/lib/ai.ts` are single-writer (`integrations-a` only).
- `src/app/app/layout.tsx` and shared navigation components are single-writer (`frontend-a` only).
- Any change to shared API contracts requires a short handoff note before next wave starts.

## Quality Gates

- Gate A (after Wave 3): auth works, seed data loads, Mayar client can call sandbox.
- Gate B (after Wave 5): freelancer can onboard, client can post gig, swipe interactions persist.
- Gate C (after Wave 7): match creates invoice, webhook updates status, dashboard reads transaction data.
- Gate D (after Wave 8): mobile viewport (375-428px) is usable for core flows, no blocker bugs.
- Gate E (after Wave 9): deployment live, webhook URL registered, submission package ready.

## Suggested Calendar (to hit Mar 15, 2026 deadline)

- 2026-03-02: Waves 1-2
- 2026-03-03 to 2026-03-04: Waves 3-4
- 2026-03-05 to 2026-03-07: Wave 5
- 2026-03-08 to 2026-03-09: Waves 6-7
- 2026-03-10 to 2026-03-11: Wave 8
- 2026-03-12 to 2026-03-13: Wave 9
- 2026-03-14: demo rehearsal + buffer fixes
- 2026-03-15: hackathon submission
