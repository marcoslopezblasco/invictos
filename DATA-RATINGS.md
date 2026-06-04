# Invictos — Data ratings rubric (internal)

## Sources

- **Squads & names:** [Fjelstul World Cup Database](https://github.com/jfjelstul/worldcup) via [datahub.io/football/worldcup](https://datahub.io/football/worldcup) (`squads.csv`)
- **Goals:** `goals.csv` (career WC goal counts)
- **Match apps:** `player_appearances.csv` (starter / appearance counts)
- **Manual overrides:** `data/sources/manual-overrides.json` (45 legends, matched by `normalizedName`)

## Pipeline

```bash
npm run import-data    # download CSVs → data/raw/
npm run generate-data  # build src/data/*.json
npm run validate-data
npm run playtest-drafts  # 50 draft simulations
```

## Player integrity

- One `playerId` per human (`p-14758` = Fjelstul `P-14758`)
- Multiple **appearances** (country + year on card)
- **Simulation** uses aggregated career profile, not single-tournament stats

## Computed profiles

`scripts/data/compute-profiles.ts`:

- Inputs: WC goals, match appearances, squad tournaments, primary position, country tier, era multiplier
- Outputs: attack, defense, control, mentality, physical, overall (position-weighted)
- **Note:** Ratings reflect **World Cup career impact**, not club reputation. A star with 3 WC apps and 0 goals will still rate modestly unless manually curated.

## Veteran boost (auto)

After legend tiers, `applyVeteranBoost` lifts **non-scoring WC regulars** by career match count:

| WC match apps | Min overall |
|---------------|------------:|
| 12+ | 80 |
| 8+ | 74 |
| 5+ | 70 |
| 3+ and 2+ tournaments | 66 |

## Legend tiers (auto)

After computing base ratings:

| Tier | Goals rule | Appearances rule |
|------|------------|------------------|
| Elite | Top 80 scorers (≥1 goal) | Top 60 by WC match apps (≥5 apps) |
| Star | Next 120 | Next 120 apps |
| Notable | Next 100 | Next 100 apps |

`applyLegendBoost` preserves position stat shape (union of both tracks). Elite = ×1.05 with OVR floor 84; star = ×1.03 / 78; notable = ×1.015 / 74.

**Auto cap:** computed profiles (after all boosts) clamp to **max OVR 96** and **max stat 98**. Only `manual-overrides.json` can assign 97–100 (reserved for a handful of all-time greats).

## Game modes (difficulty)

| Mode | Draft info | Rerolls | Simulation |
|------|------------|--------:|------------|
| **Classic** | Tiers, mundiales, partidos | 3 | +8 opponent difficulty (abstract bracket) |
| **Blind** | Names + positions only | 3 | Base difficulty |
| **Histórico** | Same as Classic | 3 | Real national teams by phase |

Classic’s visible stats are offset by a harder abstract-bracket sim.

## Squad structure (simulation)

`calculateBalanceScore` + `buildTeamProfile` penalize impossible XIs (e.g. **1-3-6** with one defender):

- Large negative **balance** subtracted directly from `tournamentPower`
- Thin back lines reduce **defensiveSecurity** (depth multiplier)
- Missing GK tanks goalkeeper/defense ratings
- Match loop adds extra **structurePenalty**; broken squads concede more and score less

A stacked attack line cannot mask a non-existent defense in the tournament sim.

**Scorelines:** Base expected goals are low (~1–2 total for balanced XIs). High-scoring games (4–5 goals per side) only when `attackOverload` is high (4+ forwards, 4-2-4 / 3-4-3, attack ≫ defense). Outcome bands cap margins (narrow win → mostly 1-goal wins).

## Historic simulation mode

`GameMode: "historico"` — card UI same as Classic; tournament faces **real national teams** from the curated country set only.

- Data: `src/data/tournament-pools.json` (built from `squads.csv` + `player_appearances.csv`)
- **Group** (3 matches): random from any team that ever played a World Cup group stage
- **R16 / QF / SF / FINAL**: random from teams that ever reached that round (any edition; cross-era in one run)
- Each fixture also picks a **World Cup year** for that opponent at that stage (from historical data)
- Opponent strength: country `tier` + stage modifier → `opponentDifficulty`
- No duplicate opponent in the same tournament run

## Visible card stats (UI only)

Simulation still uses numeric `profile.*`. Classic and Histórico mode cards show:

| Visible | Source |
|---------|--------|
| Mundiales | `worldCupsPlayed.length` |
| Partidos | `profile.matches` (WC career apps) |
| Tier label | Mapped from hidden `overall` — never show the number |

| OVR (hidden) | Tier (ES) |
|-------------:|-----------|
| ≥95 | Leyenda |
| ≥90 | Icono |
| ≥85 | Crack |
| ≥80 | Beast |
| ≥75 | Sólido |
| ≥70 | Regular |
| ≥65 | Titular |
| &lt;65 | Flojo |

### Why 100 was too common (fixed)

Previously elite tier used ×1.08 + OVR floor 88, then scaled every attribute proportionally. Top WC scorers with max goals + apps already had ~90+ bases, so many stats hit `clamp(100)` → **34 players at OVR 100** with no manual override.

Manual overrides in `manual-overrides.json` **replace** computed values (exact `normalizedName` match).

## Team aliases

| Dataset name | Invictos country |
|--------------|------------------|
| West Germany | Germany |
| FR Yugoslavia | Yugoslavia |

**Separate draft slots** (name + flag match the team that played): Yugoslavia, Serbia and Montenegro, Serbia, Czechoslovakia, Czech Republic. CSV names `Yugoslavia`, `Serbia and Montenegro`, `Serbia`, `Czechoslovakia`, `Czech Republic` map directly.

## No generic fillers

`-gen-` placeholder players are **not** generated. Every row is a real name from `squads.csv`.

## Expansion

1. Add rows to `manual-overrides.json` (`normalizedName` or `playerId`)
2. Re-run `npm run generate-data`
