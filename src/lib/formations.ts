import type { PositionCounts } from "@/types/simulation";

const FORMATION_BALANCE: Record<string, number> = {
  "4-3-3": 6,
  "4-4-2": 5,
  "3-5-2": 5,
  "5-3-2": 4,
  "4-5-1": 3,
  "3-4-3": 2,
  "5-4-1": 1,
  "3-6-1": 1,
  "4-2-4": -2,
  "3-3-4": -6,
  "2-4-4": -8,
  "2-3-5": -10,
  "1-4-6": -14,
  "1-3-6": -16,
  "1-2-7": -18,
  "0-4-6": -22,
  "6-3-1": -4,
};

export function getFormationString(counts: PositionCounts): string {
  return `${counts.DEF}-${counts.MID}-${counts.FWD}`;
}

export function getFormationBalanceModifier(counts: PositionCounts): number {
  const key = getFormationString(counts);
  return FORMATION_BALANCE[key] ?? -4;
}

/** Rewards a recognizable XI shape (GK + back line + midfield + attack). */
export function getPositionalCoverageModifier(counts: PositionCounts): number {
  let mod = 0;
  if (counts.GK >= 1) mod += 2;
  if (counts.DEF >= 4) mod += 3;
  else if (counts.DEF === 3) mod += 2;
  if (counts.MID >= 4) mod += 2;
  else if (counts.MID === 3) mod += 1;
  if (counts.FWD >= 2 && counts.FWD <= 3) mod += 1;
  return mod;
}

/** Severe penalties for squads that cannot function as a real national team. */
export function getStructureViolationPenalty(counts: PositionCounts): number {
  let penalty = 0;

  if (counts.GK < 1) penalty -= 20;
  if (counts.DEF < 1) penalty -= 24;
  else if (counts.DEF === 1) penalty -= 16;
  else if (counts.DEF === 2) penalty -= 8;

  if (counts.MID < 2) penalty -= 12;
  else if (counts.MID === 2) penalty -= 5;

  if (counts.FWD >= 7) penalty -= 14;
  else if (counts.FWD >= 6) penalty -= 10;
  else if (counts.FWD >= 5) penalty -= 6;

  if (counts.DEF >= 6) penalty -= 4;

  return penalty;
}

export function calculateBalanceScore(counts: PositionCounts): number {
  return (
    getFormationBalanceModifier(counts) +
    getPositionalCoverageModifier(counts) +
    getStructureViolationPenalty(counts)
  );
}
