import type { MatchStage } from "@/types/simulation";
import type { Country } from "@/types/player";
import { stableHash } from "./hash";
import { getCountries, getCountryByName } from "./data";
import poolsJson from "@/data/tournament-pools.json";

export interface TournamentPools {
  group: string[];
  R16: string[];
  QF: string[];
  SF: string[];
  FINAL: string[];
}

export interface HistoricalOpponent {
  country: string;
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

export function pickHistoricalOpponent(
  stage: MatchStage,
  matchSeed: string,
  usedCountries: Set<string>,
): HistoricalOpponent {
  const key = STAGE_POOL_KEY[stage];
  let list = POOLS[key];
  if (list.length === 0) {
    list = POOLS.group.length > 0 ? POOLS.group : getCountries().map((c) => c.name);
  }

  const countryName = pickFromList(list, `${matchSeed}-opp`, usedCountries);
  const country = getCountryByName(countryName) ?? getCountries()[0]!;

  return {
    country: country.name,
    flagCode: country.flagCode,
    tier: country.tier,
    difficulty: difficultyFor(country, stage),
  };
}

export function getTournamentPools(): TournamentPools {
  return POOLS;
}
