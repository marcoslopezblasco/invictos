import type { Position } from "./player";
import type { GameMode, Language } from "./simulation";

export type { GameMode, Language };

export interface DraftPick {
  round: number;
  country: string;
  worldCup: number;
  selectedAppearanceId: string;
  selectedPlayerId: string;
  /** Position the user assigns for formation / balance (may differ from natural role). */
  assignedPosition?: Position;
}

export interface Spin {
  country: string;
  worldCup: number;
}

export interface GameState {
  id: string;
  teamName: string;
  mode: GameMode;
  picks: DraftPick[];
  rerollsRemaining: number;
  lockedPlayerIds: string[];
  language: Language;
  currentSpin: Spin | null;
}

export interface PositionCounts {
  GK: number;
  DEF: number;
  MID: number;
  FWD: number;
}

export const POSITION_MINIMUMS: PositionCounts = {
  GK: 1,
  DEF: 3,
  MID: 3,
  FWD: 1,
};

export const TOTAL_PICKS = 11;
export const INITIAL_REROLLS = 3;
/** Classic shows tiers — fewer rerolls and tougher sim than Blind. */
export const INITIAL_REROLLS_CLASSIC = 2;

export function initialRerollsForMode(mode: GameMode): number {
  return mode === "classic" ? INITIAL_REROLLS_CLASSIC : INITIAL_REROLLS;
}
