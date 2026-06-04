# Invictos — Data ratings rubric (internal)

## Scale

All stats use 1–100. `overall` is position-weighted, not a simple average.

## Hybrid model

- Modern eras: influenced by known World Cup performance
- Pre-1970: lower caps via `eraMultiplier` in generator; more manual curation for legends
- Legends in `CURATED` array: hand-tuned
- Squad fillers: `tierBoost` + position template

## Position weights (overall intuition)

| Position | Primary stats |
|----------|----------------|
| GK | defense, mentality |
| DEF | defense, control |
| MID | control, mentality |
| FWD | attack, physical |

## Player integrity

One `playerId` per human. Appearances are cosmetic (country + year). Simulation always uses `careerWorldCupProfile` / `profile`.

## Expansion

Add rows to `CURATED` in `scripts/generate-data.ts`, then `npm run generate-data` and `npm run validate-data`.
