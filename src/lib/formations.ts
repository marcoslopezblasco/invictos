import type { PositionCounts } from "@/types/simulation";

const FORMATION_BALANCE: Record<string, number> = {
  "4-3-3": 6,
  "4-4-2": 5,
  "3-5-2": 5,
  "5-3-2": 4,
  "3-4-3": 2,
  "3-6-1": 1,
  "5-4-1": 1,
  "4-2-4": -2,
  "3-3-4": -6,
  "6-3-1": -4,
};

export function getFormationString(counts: PositionCounts): string {
  return `${counts.DEF}-${counts.MID}-${counts.FWD}`;
}

export function getFormationBalanceModifier(counts: PositionCounts): number {
  const key = getFormationString(counts);
  return FORMATION_BALANCE[key] ?? 0;
}

export function getPositionalCoverageModifier(counts: PositionCounts): number {
  let mod = 0;
  if (counts.GK >= 1) mod += 2;
  if (counts.DEF >= 3) mod += 2;
  if (counts.MID >= 3) mod += 2;
  if (counts.FWD >= 1) mod += 1;
  if (counts.DEF === 3 && counts.MID >= 4) mod += 1;
  return mod;
}

export function getOverloadPenalty(counts: PositionCounts): number {
  let penalty = 0;
  if (counts.FWD >= 5) penalty -= 8;
  else if (counts.FWD >= 4) penalty -= 4;
  if (counts.MID <= 2) penalty -= 6;
  if (counts.DEF <= 3 && counts.MID <= 2) penalty -= 3;
  if (counts.DEF >= 6) penalty -= 2;
  return penalty;
}

export function calculateBalanceScore(counts: PositionCounts): number {
  return (
    getFormationBalanceModifier(counts) +
    getPositionalCoverageModifier(counts) +
    getOverloadPenalty(counts)
  );
}
