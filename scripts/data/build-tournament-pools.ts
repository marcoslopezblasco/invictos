import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import {
  canonicalTeamName,
  COUNTRIES,
  parseTournamentYear,
} from "./constants";

export type HistoricalPoolStage = "group" | "R16" | "QF" | "SF" | "FINAL";

/** Country name → World Cup years they reached that stage (sorted). */
export type StagePool = Record<string, number[]>;

export interface TournamentPools {
  group: StagePool;
  R16: StagePool;
  QF: StagePool;
  SF: StagePool;
  FINAL: StagePool;
}

function mapStage(stageName: string): HistoricalPoolStage | null {
  const s = stageName.trim().toLowerCase();
  if (s === "group stage") return "group";
  if (s === "round of 16") return "R16";
  if (s.includes("quarter")) return "QF";
  if (s.includes("semi-final")) return "SF";
  if (s === "final") return "FINAL";
  return null;
}

function addYear(
  pools: Record<HistoricalPoolStage, Map<string, Set<number>>>,
  stage: HistoricalPoolStage,
  country: string,
  year: number,
): void {
  const byCountry = pools[stage].get(country) ?? new Set<number>();
  byCountry.add(year);
  pools[stage].set(country, byCountry);
}

function finalize(pool: Map<string, Set<number>>): StagePool {
  const out: StagePool = {};
  for (const [country, years] of pool) {
    out[country] = [...years].sort((a, b) => a - b);
  }
  return out;
}

export function buildTournamentPools(rawDir: string): TournamentPools {
  const maps: Record<HistoricalPoolStage, Map<string, Set<number>>> = {
    group: new Map(),
    R16: new Map(),
    QF: new Map(),
    SF: new Map(),
    FINAL: new Map(),
  };

  const squadsPath = join(rawDir, "squads.csv");
  const squads = parse(readFileSync(squadsPath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
  }) as { team_name: string; tournament_name: string }[];

  for (const row of squads) {
    const name = canonicalTeamName(row.team_name);
    const year = parseTournamentYear(row.tournament_name);
    if (name && year) addYear(maps, "group", name, year);
  }

  const appsPath = join(rawDir, "player_appearances.csv");
  const apps = parse(readFileSync(appsPath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
  }) as {
    team_name: string;
    stage_name: string;
    tournament_name: string;
  }[];

  for (const row of apps) {
    const name = canonicalTeamName(row.team_name);
    const year = parseTournamentYear(row.tournament_name);
    const pool = mapStage(row.stage_name);
    if (!name || !year || !pool) continue;
    addYear(maps, pool, name, year);
    if (pool !== "group") addYear(maps, "group", name, year);
  }

  for (const c of COUNTRIES) {
    for (const year of c.worldCups) {
      if (!maps.group.has(c.name)) {
        addYear(maps, "group", c.name, year);
      }
    }
  }

  return {
    group: finalize(maps.group),
    R16: finalize(maps.R16),
    QF: finalize(maps.QF),
    SF: finalize(maps.SF),
    FINAL: finalize(maps.FINAL),
  };
}

export function poolCountries(pool: StagePool): string[] {
  return Object.keys(pool).sort((a, b) => a.localeCompare(b));
}
