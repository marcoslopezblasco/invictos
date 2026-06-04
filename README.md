# Invictos

Mobile-first web app: draft a historic World Cup XI and simulate if they can win the tournament undefeated.

## Stack

- Next.js 16 (App Router)
- TypeScript, Tailwind CSS v4
- Curated JSON data (5300+ players, 5400 appearances, 24 countries)
- Deterministic simulation engine (Vitest)

## Scripts

```bash
npm run dev          # local dev
npm test             # unit tests
npm run generate-data # rebuild JSON dataset
npm run validate-data # validate dataset
npm run build        # production build
```

## Deploy (Vercel)

1. Push repo to GitHub
2. Import in [Vercel](https://vercel.com)
3. Build runs `validate-data` then `next build`
4. Set custom domain to `invictos.app` if desired

## Game flow

Home → Play (team name) → 11-pick draft → Review → Simulate → Result + share card

Modes: **Classic** (stats visible) · **Blind** (names only)
