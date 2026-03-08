# Lancerin

Swipe-based freelance gig matching. Freelancers swipe on gigs, clients pick from interested freelancers. Payment flows through Lancerin via [Mayar](https://mayar.id).

Built for the **Mayar Vibecoding Competition 2026**.

**Live:** [lancerin.rxmxdhxni.workers.dev](https://lancerin.rxmxdhxni.workers.dev)

## How it works

1. **Client** posts a gig with budget range, skills, and deadline
2. **Freelancer** sees AI-ranked gigs and swipes right to apply
3. **Client** picks a freelancer and sets an agreed amount
4. **Payment** — Mayar generates an invoice, client pays through the link
5. **Freelancer** delivers, client confirms — gig complete

## Stack

| Layer     | Tech                                          |
| --------- | --------------------------------------------- |
| Framework | Vinext (Next.js App Router on Vite)           |
| Auth      | NextAuth v4, Google OAuth                     |
| UI        | Tailwind CSS v4, Framer Motion, Iconify Solar |
| AI        | OpenRouter (MiniMax M2.5) for gig ranking     |
| Payments  | Mayar REST API                                |
| Storage   | JSON files (dev), Cloudflare KV (prod)        |
| Deploy    | Cloudflare Workers                            |

## Setup

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run seed                  # reset demo data
npm run dev                   # http://localhost:3000
```

### Environment variables

See `.env.example`. Required: `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Optional: `MAYAR_API_KEY`, `OPENROUTER_API_KEY` (app works without these using fallbacks).

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Vinext dev server                  |
| `npm run build`     | Production build                   |
| `npm run seed`      | Reset local `data/*.json`          |
| `npm run seed:kv`   | Reset local + remote Cloudflare KV |
| `npm run deploy`    | Deploy to Cloudflare Workers       |
| `npm run typecheck` | TypeScript strict check            |
| `npm run lint`      | ESLint                             |

## Deploy to Cloudflare Workers

```bash
npm run build
npx wrangler deploy
```

Secrets (set via `npx wrangler secret put <NAME>`): `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MAYAR_API_KEY`, `OPENROUTER_API_KEY`.

## License

[MIT](LICENSE)
