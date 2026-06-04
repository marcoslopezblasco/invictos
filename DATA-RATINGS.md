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

## Legend tiers (auto, ~300 players)

After computing base ratings:

| Tier | Count | Rule |
|------|------:|------|
| Elite | Top 80 WC goal scorers | `applyLegendBoost(..., "elite")` |
| Star | Next 120 | `"star"` |
| Notable | Next 100 | `"notable"` |

Manual overrides in `manual-overrides.json` **replace** computed values (exact `normalizedName` match).

## Team aliases

| Dataset name | Invictos country |
|--------------|------------------|
| West Germany | Germany |
| Czechoslovakia | Czech Republic |
| Yugoslavia / FR Yugoslavia / Serbia and Montenegro | Serbia |

## No generic fillers

`-gen-` placeholder players are **not** generated. Every row is a real name from `squads.csv`.

## Expansion

1. Add rows to `manual-overrides.json` (`normalizedName` or `playerId`)
2. Re-run `npm run generate-data`
