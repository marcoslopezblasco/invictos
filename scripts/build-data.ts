/**
 * Build curated Invictos dataset from Fjelstul World Cup Database (datahub.io).
 * Source: https://github.com/jfjelstul/worldcup — CC-licensed research data.
 *
 * Run: npm run generate-data
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import {
  COUNTRIES,
  WORLD_CUP_YEARS,
  canonicalTeamName,
  parseTournamentYear,
  mapPosition,
  slug,
  formatPlayerName,
  type Position,
} from "./data/constants";
import {
  computeProfileFromCareer,
  applyLegendBoost,
  type PlayerWorldCupProfile,
  type CareerAgg,
} from "./data/compute-profiles";

const ROOT = process.cwd();
const RAW = join(ROOT, "data", "raw");
const OUT = join(ROOT, "src", "data");
const OVERRIDES_PATH = join(ROOT, "data", "sources", "manual-overrides.json");

const countryCupAllowed = new Map<string, Set<number>>();
for (const c of COUNTRIES) {
  countryCupAllowed.set(c.name, new Set(c.worldCups));
}

function readCsv(name: string): Record<string, string>[] {
  const path = join(RAW, name);
  if (!existsSync(path)) {
    throw new Error(`Missing ${path}. Run: npm run import-data`);
  }
  return parse(readFileSync(path, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
  }) as Record<string, string>[];
}

interface ManualOverride {
  playerId?: string;
  normalizedName?: string;
  profile: PlayerWorldCupProfile;
}

interface SquadRow {
  playerId: string;
  name: string;
  normalizedName: string;
  country: string;
  year: number;
  position: Position;
}

function loadOverrides(): {
  byId: Map<string, PlayerWorldCupProfile>;
  byName: Map<string, PlayerWorldCupProfile>;
} {
  const list = JSON.parse(
    readFileSync(OVERRIDES_PATH, "utf-8"),
  ) as ManualOverride[];
  const byId = new Map<string, PlayerWorldCupProfile>();
  const byName = new Map<string, PlayerWorldCupProfile>();
  for (const o of list) {
    if (o.playerId) byId.set(o.playerId, o.profile);
    if (o.normalizedName) byName.set(o.normalizedName, o.profile);
  }
  return { byId, byName };
}

function main() {
  console.log("Loading Fjelstul CSVs...");
  const squads = readCsv("squads.csv");
  const goals = readCsv("goals.csv");
  const appearances = readCsv("player_appearances.csv");

  const goalCount = new Map<string, number>();
  for (const g of goals) {
    if (g.own_goal === "1") continue;
    if (!g.tournament_name?.includes("Men")) continue;
    const pid = g.player_id;
    goalCount.set(pid, (goalCount.get(pid) ?? 0) + 1);
  }

  const matchApps = new Map<string, number>();
  const starterApps = new Map<string, number>();
  for (const a of appearances) {
    if (!a.tournament_name?.includes("Men")) continue;
    const pid = a.player_id;
    matchApps.set(pid, (matchApps.get(pid) ?? 0) + 1);
    if (a.starter === "1") {
      starterApps.set(pid, (starterApps.get(pid) ?? 0) + 1);
    }
  }

  const squadRows: SquadRow[] = [];
  const seenAppearance = new Set<string>();

  for (const row of squads) {
    if (!row.tournament_name?.includes("Men")) continue;
    const year = parseTournamentYear(row.tournament_name);
    if (!year || !WORLD_CUP_YEARS.includes(year as (typeof WORLD_CUP_YEARS)[number])) {
      continue;
    }
    const country = canonicalTeamName(row.team_name);
    if (!country) continue;
    const allowed = countryCupAllowed.get(country);
    if (!allowed?.has(year)) continue;

    const position = mapPosition(row.position_code);
    if (!position) continue;

    const playerId = row.player_id.toLowerCase();
    const name = formatPlayerName(row.given_name, row.family_name);
    const normalizedName = slug(name);
    const appKey = `${playerId}::${country}::${year}`;
    if (seenAppearance.has(appKey)) continue;
    seenAppearance.add(appKey);

    squadRows.push({
      playerId,
      name,
      normalizedName,
      country,
      year,
      position,
    });
  }

  console.log(`Imported ${squadRows.length} squad appearances`);

  const playerMeta = new Map<
    string,
    {
      name: string;
      normalizedName: string;
      position: Position;
      countries: Set<string>;
      years: Set<number>;
    }
  >();

  for (const s of squadRows) {
    let meta = playerMeta.get(s.playerId);
    if (!meta) {
      meta = {
        name: s.name,
        normalizedName: s.normalizedName,
        position: s.position,
        countries: new Set(),
        years: new Set(),
      };
      playerMeta.set(s.playerId, meta);
    }
    meta.countries.add(s.country);
    meta.years.add(s.year);
    if (s.name.length > meta.name.length) meta.name = s.name;
  }

  const { byId: overrideById, byName: overrideByName } = loadOverrides();

  const goalRanking = [...playerMeta.keys()]
    .map((id) => ({ id, goals: goalCount.get(id) ?? 0 }))
    .sort((a, b) => b.goals - a.goals);

  const eliteIds = new Set(goalRanking.slice(0, 80).map((x) => x.id));
  const starIds = new Set(goalRanking.slice(80, 200).map((x) => x.id));
  const notableIds = new Set(goalRanking.slice(200, 300).map((x) => x.id));

  const countryTier = new Map(COUNTRIES.map((c) => [c.name, c.tier]));

  const players: Array<{
    id: string;
    name: string;
    normalizedName: string;
    countries: string[];
    position: Position;
    worldCupsPlayed: number[];
    profile: PlayerWorldCupProfile;
  }> = [];

  for (const [playerId, meta] of playerMeta) {
    const years = [...meta.years].sort((a, b) => a - b);
    const primaryCountry = [...meta.countries][0]!;
    const tier = countryTier.get(primaryCountry) ?? 3;

    const career: CareerAgg = {
      goals: goalCount.get(playerId) ?? 0,
      matchApps: matchApps.get(playerId) ?? 0,
      squadTournaments: years.length,
      starterApps: starterApps.get(playerId) ?? 0,
    };

    let profile =
      overrideById.get(playerId) ??
      overrideByName.get(meta.normalizedName) ??
      computeProfileFromCareer(meta.position, career, years, tier);

    if (!overrideById.has(playerId) && !overrideByName.has(meta.normalizedName)) {
      if (eliteIds.has(playerId)) profile = applyLegendBoost(profile, "elite");
      else if (starIds.has(playerId)) profile = applyLegendBoost(profile, "star");
      else if (notableIds.has(playerId)) profile = applyLegendBoost(profile, "notable");
    }

    profile = { ...profile, goals: career.goals || undefined, matches: career.matchApps || undefined };

    players.push({
      id: playerId,
      name: meta.name,
      normalizedName: meta.normalizedName,
      countries: [...meta.countries].sort(),
      position: meta.position,
      worldCupsPlayed: years,
      profile,
    });
  }

  const appearancesOut = squadRows.map((s) => ({
    id: `${s.playerId}-${slug(s.country)}-${s.year}`,
    playerId: s.playerId,
    country: s.country,
    worldCup: s.year,
    displayName: s.name,
    displayCountry: s.country,
    displayYear: s.year,
    position: s.position,
  }));

  const yearsByCountry = new Map<string, Set<number>>();
  for (const app of appearancesOut) {
    const set = yearsByCountry.get(app.country) ?? new Set();
    set.add(app.worldCup);
    yearsByCountry.set(app.country, set);
  }
  for (const c of COUNTRIES) {
    const years = yearsByCountry.get(c.name);
    if (years && years.size > 0) {
      c.worldCups = [...years].sort((a, b) => a - b);
    }
  }

  const worldcups = WORLD_CUP_YEARS.map((year) => ({ year }));

  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "players.json"), JSON.stringify(players));
  writeFileSync(join(OUT, "appearances.json"), JSON.stringify(appearancesOut));
  writeFileSync(join(OUT, "countries.json"), JSON.stringify(COUNTRIES, null, 2));
  writeFileSync(join(OUT, "worldcups.json"), JSON.stringify(worldcups, null, 2));

  const genCount = players.filter((p) => p.id.includes("-gen-")).length;
  console.log(`Players: ${players.length} (${genCount} generic — should be 0)`);
  console.log(`Appearances: ${appearancesOut.length}`);
  console.log(`Manual overrides applied: ${overrideByName.size} by name`);
  console.log(`Legend tiers: elite ${eliteIds.size}, star ${starIds.size}, notable ${notableIds.size}`);
}

main();
