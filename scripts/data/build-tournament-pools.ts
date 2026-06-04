import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import { canonicalTeamName, COUNTRIES } from "./constants";

export type HistoricalPoolStage = "group" | "R16" | "QF" | "SF" | "FINAL";

export interface TournamentPools {
  group: string[];
  R16: string[];
  QF: string[];
  SF: string[];
  FINAL: string[];
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

export function buildTournamentPools(rawDir: string): TournamentPools {
  const group = new Set<string>();
  const R16 = new Set<string>();
  const QF = new Set<string>();
  const SF = new Set<string>();
  const FINAL = new Set<string>();

  const squadsPath = join(rawDir, "squads.csv");
  const squads = parse(readFileSync(squadsPath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
  }) as { team_name: string }[];

  for (const row of squads) {
    const name = canonicalTeamName(row.team_name);
    if (name) group.add(name);
  }

  const appsPath = join(rawDir, "player_appearances.csv");
  const apps = parse(readFileSync(appsPath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
  }) as { team_name: string; stage_name: string }[];

  for (const row of apps) {
    const name = canonicalTeamName(row.team_name);
    if (!name) continue;
    const pool = mapStage(row.stage_name);
    if (!pool) continue;
    if (pool === "group") group.add(name);
    else if (pool === "R16") R16.add(name);
    else if (pool === "QF") QF.add(name);
    else if (pool === "SF") SF.add(name);
    else FINAL.add(name);
  }

  const sort = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b));

  const pools: TournamentPools = {
    group: sort(group),
    R16: sort(R16),
    QF: sort(QF),
    SF: sort(SF),
    FINAL: sort(FINAL),
  };

  for (const c of COUNTRIES) {
    if (c.worldCups.length > 0 && !pools.group.includes(c.name)) {
      pools.group.push(c.name);
    }
  }
  pools.group.sort((a, b) => a.localeCompare(b));

  return pools;
}
