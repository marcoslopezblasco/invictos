import type { Position } from "./constants";

export interface PlayerWorldCupProfile {
  attack: number;
  defense: number;
  control: number;
  mentality: number;
  physical: number;
  overall: number;
  goals?: number;
  assists?: number;
  matches?: number;
}

export interface CareerAgg {
  goals: number;
  matchApps: number;
  squadTournaments: number;
  starterApps: number;
}

/** Hard cap for auto-generated stats (manual overrides may go higher). */
export const MAX_AUTO_STAT = 98;
export const MAX_AUTO_OVERALL = 96;

function clamp(n: number, min = 1, max = MAX_AUTO_STAT): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function clampOverall(n: number): number {
  return Math.max(1, Math.min(MAX_AUTO_OVERALL, Math.round(n)));
}

export function eraMultiplierFromYears(years: number[]): number {
  const earliest = Math.min(...years);
  if (earliest < 1950) return 0.88;
  if (earliest < 1970) return 0.92;
  if (earliest < 1990) return 0.96;
  return 1;
}

export function computeProfileFromCareer(
  position: Position,
  career: CareerAgg,
  tournamentYears: number[],
  tier: 1 | 2 | 3,
): PlayerWorldCupProfile {
  const { goals, matchApps, squadTournaments, starterApps } = career;
  const era = eraMultiplierFromYears(tournamentYears);
  const tierBoost = tier === 1 ? 4 : tier === 2 ? 2 : 0;

  const production =
    Math.min(goals * 2.8, 28) +
    Math.min(matchApps * 0.5, 26) +
    Math.min(squadTournaments * 2.5, 14) +
    Math.min(starterApps * 0.4, 16);

  const base = (56 + production + tierBoost) * era;

  let attack = base;
  let defense = base;
  let control = base;
  let mentality = base + Math.min(squadTournaments * 1.2, 8);
  let physical = base - 2;

  switch (position) {
    case "GK":
      attack = 12 + Math.min(goals * 2, 8);
      defense = base + 12;
      control = base - 5;
      mentality = base + 6;
      physical = base + 4;
      break;
    case "DEF":
      attack = base - 12 + Math.min(goals * 2, 12);
      defense = base + 10;
      control = base;
      physical = base + 2;
      break;
    case "MID":
      attack = base - 2 + Math.min(goals * 1.5, 10);
      defense = base - 6;
      control = base + 8;
      break;
    case "FWD":
      attack = base + 10 + Math.min(goals * 1.2, 12);
      defense = base - 18;
      control = base - 2;
      physical = base + 1;
      break;
  }

  const overall = weightedOverall(position, {
    attack,
    defense,
    control,
    mentality,
    physical,
  });

  return {
    attack: clamp(attack),
    defense: clamp(defense),
    control: clamp(control),
    mentality: clamp(mentality),
    physical: clamp(physical),
    overall: clampOverall(overall),
    goals: goals || undefined,
    matches: matchApps || undefined,
  };
}

export function weightedOverall(
  position: Position,
  s: Pick<PlayerWorldCupProfile, "attack" | "defense" | "control" | "mentality" | "physical">,
): number {
  const w: Record<
    Position,
    Record<"attack" | "defense" | "control" | "mentality" | "physical", number>
  > = {
    GK: { attack: 0.02, defense: 0.35, control: 0.15, mentality: 0.28, physical: 0.2 },
    DEF: { attack: 0.1, defense: 0.35, control: 0.2, mentality: 0.2, physical: 0.15 },
    MID: { attack: 0.2, defense: 0.15, control: 0.3, mentality: 0.2, physical: 0.15 },
    FWD: { attack: 0.35, defense: 0.08, control: 0.22, mentality: 0.2, physical: 0.15 },
  };
  const weights = w[position];
  return (
    s.attack * weights.attack +
    s.defense * weights.defense +
    s.control * weights.control +
    s.mentality * weights.mentality +
    s.physical * weights.physical
  );
}

/** Lift profiles for players who played significant WC minutes (non-scorers). */
export function applyVeteranBoost(
  profile: PlayerWorldCupProfile,
  career: CareerAgg,
  position: Position,
): PlayerWorldCupProfile {
  const { matchApps, squadTournaments } = career;
  let floor = 0;
  if (matchApps >= 12) floor = 80;
  else if (matchApps >= 8) floor = 74;
  else if (matchApps >= 5) floor = 70;
  else if (matchApps >= 3 && squadTournaments >= 2) floor = 66;

  if (floor <= profile.overall) return profile;

  const factor = floor / Math.max(profile.overall, 1);
  const attrs = {
    attack: profile.attack * factor,
    defense: profile.defense * factor,
    control: profile.control * factor,
    mentality: profile.mentality * factor,
    physical: profile.physical * factor,
  };

  return {
    attack: clamp(attrs.attack),
    defense: clamp(attrs.defense),
    control: clamp(attrs.control),
    mentality: clamp(attrs.mentality),
    physical: clamp(attrs.physical),
    overall: clampOverall(weightedOverall(position, attrs)),
    goals: profile.goals,
    assists: profile.assists,
    matches: profile.matches,
  };
}

/** Boost computed profile toward legend tier (preserves position shape) */
export function applyLegendBoost(
  profile: PlayerWorldCupProfile,
  tier: "elite" | "star" | "notable",
  position: Position,
): PlayerWorldCupProfile {
  const mul = tier === "elite" ? 1.05 : tier === "star" ? 1.03 : 1.015;
  const overallFloor = tier === "elite" ? 84 : tier === "star" ? 78 : 74;

  const attrs = {
    attack: profile.attack * mul,
    defense: profile.defense * mul,
    control: profile.control * mul,
    mentality: profile.mentality * mul,
    physical: profile.physical * mul,
  };

  let overall = weightedOverall(position, attrs);
  if (overall < overallFloor && overall > 0) {
    const factor = overallFloor / overall;
    attrs.attack *= factor;
    attrs.defense *= factor;
    attrs.control *= factor;
    attrs.mentality *= factor;
    attrs.physical *= factor;
    overall = overallFloor;
  }

  return {
    attack: clamp(attrs.attack),
    defense: clamp(attrs.defense),
    control: clamp(attrs.control),
    mentality: clamp(attrs.mentality),
    physical: clamp(attrs.physical),
    overall: clampOverall(overall),
    goals: profile.goals,
    assists: profile.assists,
    matches: profile.matches,
  };
}
