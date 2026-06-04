# Invictos

Mobile-first web app: draft a historic World Cup XI and simulate if they can win the tournament undefeated.

## Stack

- Next.js 16 (App Router)
- TypeScript, Tailwind CSS v4
- Curated JSON data (~4800 real players, ~6500 appearances, 24 countries) from the Fjelstul World Cup Database
- Deterministic simulation engine (Vitest)

## Scripts

```bash
npm run dev            # local dev
npm test               # unit tests
npm run import-data    # download source CSVs (once)
npm run generate-data  # build players.json from squads + stats
npm run validate-data  # validate dataset
npm run playtest-drafts # 50 draft sims (balance check)
npm run build          # production build
```

Data is built from the [Fjelstul World Cup Database](https://github.com/jfjelstul/worldcup) (see `DATA-RATINGS.md`).

## Deploy (Vercel)

1. Push repo to GitHub
2. Import in [Vercel](https://vercel.com)
3. Build runs `validate-data` then `next build`
4. Set custom domain to `invictos.app` if desired

## Game flow

Home → Play (team name) → 11-pick draft → Review → Simulate → Result + share card

Modes: **Classic** (stats visible) · **Blind** (names only)
