import type { MatchStage } from "@/types/simulation";
import type { Country } from "@/types/player";
import { stableHash } from "./hash";
import { getCountries, getCountryByName } from "./data";
import poolsJson from "@/data/tournament-pools.json";

export type StagePool = Record<string, number[]>;

export interface TournamentPools {
  group: StagePool;
  R16: StagePool;
  QF: StagePool;
  SF: StagePool;
  FINAL: StagePool;
}

export interface HistoricalOpponent {
  country: string;
  worldCup: number;
  flagCode: string | null;
  tier: 1 | 2 | 3;
  difficulty: number;
}

const POOLS = poolsJson as TournamentPools;

const STAGE_POOL_KEY: Record<MatchStage, keyof TournamentPools> = {
  GROUP_1: "group",
  GROUP_2: "group",
  GROUP_3: "group",
  R16: "R16",
  QF: "QF",
  SF: "SF",
  FINAL: "FINAL",
};

const TIER_BASE: Record<1 | 2 | 3, number> = { 1: 86, 2: 80, 3: 74 };

const STAGE_MOD: Record<MatchStage, number> = {
  GROUP_1: -6,
  GROUP_2: -4,
  GROUP_3: -2,
  R16: 0,
  QF: 2,
  SF: 4,
  FINAL: 6,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function difficultyFor(country: Country, stage: MatchStage): number {
  return clamp(TIER_BASE[country.tier] + STAGE_MOD[stage], 65, 98);
}

function pickFromList(list: string[], seed: string, used: Set<string>): string {
  const available = list.filter((c) => !used.has(c));
  const pool = available.length > 0 ? available : list;
  if (pool.length === 0) {
    const fallback = getCountries();
    return fallback[stableHash(seed) % fallback.length]!.name;
  }
  return pool[stableHash(seed) % pool.length]!;
}

function pickYear(years: number[], seed: string): number {
  if (years.length === 0) return 1970;
  return years[stableHash(`${seed}-year`) % years.length]!;
}

function getStagePool(stage: MatchStage): StagePool {
  const key = STAGE_POOL_KEY[stage];
  const pool = POOLS[key];
  if (Object.keys(pool).length > 0) return pool;
  return POOLS.group;
}

export function pickHistoricalOpponent(
  stage: MatchStage,
  matchSeed: string,
  usedCountries: Set<string>,
): HistoricalOpponent {
  const stagePool = getStagePool(stage);
  const countries = Object.keys(stagePool).sort((a, b) => a.localeCompare(b));
  const fallbackList =
    countries.length > 0
      ? countries
      : getCountries().map((c) => c.name);

  const countryName = pickFromList(
    fallbackList,
    `${matchSeed}-opp`,
    usedCountries,
  );
  const country = getCountryByName(countryName) ?? getCountries()[0]!;
  const years =
    stagePool[countryName] ??
    POOLS.group[countryName] ??
    country.worldCups ??
    [1970];
  const worldCup = pickYear(years, matchSeed);

  return {
    country: country.name,
    worldCup,
    flagCode: country.flagCode,
    tier: country.tier,
    difficulty: difficultyFor(country, stage),
  };
}

export function getTournamentPools(): TournamentPools {
  return POOLS;
}

export function poolCountriesForStage(
  stage: keyof TournamentPools,
): string[] {
  return Object.keys(POOLS[stage]).sort((a, b) => a.localeCompare(b));
}
