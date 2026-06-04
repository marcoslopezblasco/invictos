import type { Player, PlayerAppearance, Position } from "./player";

export type GameMode = "classic" | "blind" | "historico";
export type Language = "es" | "en";

export type Badge =
  | "PERFECT_CHAMPION"
  | "UNDEFEATED_CHAMPION"
  | "CHAMPION"
  | "UNDEFEATED_ELIMINATED"
  | "ELIMINATED";

export type MatchStage =
  | "GROUP_1"
  | "GROUP_2"
  | "GROUP_3"
  | "R16"
  | "QF"
  | "SF"
  | "FINAL";

export type MatchResultType = "W" | "D" | "L";

export interface TeamProfile {
  attackPower: number;
  defensiveSecurity: number;
  midfieldControl: number;
  mentality: number;
  physicality: number;
  balance: number;
  goalkeeperQuality: number;
  tournamentPower: number;
  formation: string;
  /** 0–1: attack-heavy XI (many FWD, 4-2-4, etc.) — drives high-scoring games. */
  attackOverload: number;
}

export interface DraftedPlayer {
  appearance: PlayerAppearance;
  player: Player;
}

export interface MatchResult {
  stage: MatchStage;
  opponentDifficulty: number;
  /** Set in historico mode — real national team from WC history (24-country pool). */
  opponentCountry?: string;
  /** Edition of that team in this fixture (may differ per match in one run). */
  opponentWorldCup?: number;
  opponentFlagCode?: string | null;
  goalsFor: number;
  goalsAgainst: number;
  result: MatchResultType;
  advancedOnPenalties?: boolean;
  eliminatedOnPenalties?: boolean;
}

export interface TournamentResult {
  matches: MatchResult[];
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  finalStage: string;
  champion: boolean;
  undefeated: boolean;
  perfect: boolean;
  badge: Badge;
  score: number;
  narrative: string;
  teamProfile: TeamProfile;
  formation: string;
}

export interface PositionCounts {
  GK: number;
  DEF: number;
  MID: number;
  FWD: number;
}

export function countPositions(players: DraftedPlayer[]): PositionCounts {
  const counts: PositionCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const { appearance } of players) {
    counts[appearance.position]++;
  }
  return counts;
}
