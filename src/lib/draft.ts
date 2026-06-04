import type { Country, Player, PlayerAppearance } from "@/types/player";
import type { GameState, PositionCounts, Spin } from "@/types/game";
import {
  INITIAL_REROLLS,
  POSITION_MINIMUMS,
  TOTAL_PICKS,
} from "@/types/game";
import type { DraftedPlayer } from "@/types/simulation";
import { calculateMarginalContribution } from "./scoring";
import { stableHash } from "./hash";

export interface DataIndexes {
  countries: Country[];
  appearancesByCountryCup: Map<string, PlayerAppearance[]>;
  playersById: Map<string, Player>;
  countryCupCombos: Spin[];
}

function comboKey(country: string, worldCup: number): string {
  return `${country}::${worldCup}`;
}

export function buildCountryCupCombos(indexes: DataIndexes): Spin[] {
  const combos: Spin[] = [];
  for (const country of indexes.countries) {
    for (const year of country.worldCups) {
      const key = comboKey(country.name, year);
      if (indexes.appearancesByCountryCup.has(key)) {
        combos.push({ country: country.name, worldCup: year });
      }
    }
  }
  return combos;
}

export function getPositionCountsFromPicks(
  picks: GameState["picks"],
  playersById: Map<string, Player>,
): PositionCounts {
  const counts: PositionCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const pick of picks) {
    const player = playersById.get(pick.selectedPlayerId);
    if (player) counts[player.position]++;
  }
  return counts;
}

function picksRemaining(gameState: GameState): number {
  return TOTAL_PICKS - gameState.picks.length;
}

function canStillSatisfyMinimums(
  counts: PositionCounts,
  picksLeft: number,
): boolean {
  const needGK = Math.max(0, POSITION_MINIMUMS.GK - counts.GK);
  const needDEF = Math.max(0, POSITION_MINIMUMS.DEF - counts.DEF);
  const needMID = Math.max(0, POSITION_MINIMUMS.MID - counts.MID);
  const needFWD = Math.max(0, POSITION_MINIMUMS.FWD - counts.FWD);
  const minNeeded = needGK + needDEF + needMID + needFWD;
  return minNeeded <= picksLeft;
}

function getForcedPosition(counts: PositionCounts, picksLeft: number): keyof PositionCounts | null {
  if (picksLeft === 1) {
    if (counts.GK < POSITION_MINIMUMS.GK) return "GK";
    if (counts.DEF < POSITION_MINIMUMS.DEF) return "DEF";
    if (counts.MID < POSITION_MINIMUMS.MID) return "MID";
    if (counts.FWD < POSITION_MINIMUMS.FWD) return "FWD";
  }
  if (!canStillSatisfyMinimums(counts, picksLeft)) {
    if (counts.GK < POSITION_MINIMUMS.GK) return "GK";
    if (counts.DEF < POSITION_MINIMUMS.DEF) return "DEF";
    if (counts.MID < POSITION_MINIMUMS.MID) return "MID";
    if (counts.FWD < POSITION_MINIMUMS.FWD) return "FWD";
  }
  return null;
}

function combosWithPosition(
  combos: Spin[],
  indexes: DataIndexes,
  position: keyof PositionCounts,
  lockedIds: Set<string>,
): Spin[] {
  return combos.filter((c) => {
    const apps = indexes.appearancesByCountryCup.get(comboKey(c.country, c.worldCup)) ?? [];
    return apps.some(
      (a) =>
        !lockedIds.has(a.playerId) &&
        (indexes.playersById.get(a.playerId)?.position === position ||
          a.position === position),
    );
  });
}

export function generateSpin(
  gameState: GameState,
  indexes: DataIndexes,
  spinIndex: number,
): Spin {
  const locked = new Set(gameState.lockedPlayerIds);
  const counts = getPositionCountsFromPicks(gameState.picks, indexes.playersById);
  const picksLeft = picksRemaining(gameState);
  const forced = getForcedPosition(counts, picksLeft);
  const combos = indexes.countryCupCombos;

  let pool = combos;
  if (forced) {
    const filtered = combosWithPosition(combos, indexes, forced, locked);
    if (filtered.length > 0) pool = filtered;
  }

  const seed = `${gameState.id}-${gameState.picks.length}-${spinIndex}`;
  const idx = stableHash(seed) % pool.length;
  return pool[idx] ?? combos[0]!;
}

export function getEligibleAppearances(
  spin: Spin,
  lockedPlayerIds: Set<string>,
  indexes: DataIndexes,
): PlayerAppearance[] {
  const key = comboKey(spin.country, spin.worldCup);
  const apps = indexes.appearancesByCountryCup.get(key) ?? [];
  return apps.filter((a) => !lockedPlayerIds.has(a.playerId));
}

export function sortEligibleByContribution(
  appearances: PlayerAppearance[],
  currentTeam: DraftedPlayer[],
  playersById: Map<string, Player>,
): PlayerAppearance[] {
  return [...appearances].sort((a, b) => {
    const playerA = playersById.get(a.playerId);
    const playerB = playersById.get(b.playerId);
    if (!playerA || !playerB) return 0;
    return (
      calculateMarginalContribution(playerB, currentTeam) -
      calculateMarginalContribution(playerA, currentTeam)
    );
  });
}

export function picksToDrafted(
  picks: GameState["picks"],
  appearancesById: Map<string, PlayerAppearance>,
  playersById: Map<string, Player>,
): DraftedPlayer[] {
  return picks
    .map((pick) => {
      const appearance = appearancesById.get(pick.selectedAppearanceId);
      const player = playersById.get(pick.selectedPlayerId);
      if (!appearance || !player) return null;
      return { appearance, player };
    })
    .filter((x): x is DraftedPlayer => x !== null);
}

export function createInitialGameState(
  id: string,
  teamName: string,
  mode: GameState["mode"],
  language: GameState["language"],
  initialSpin: Spin,
): GameState {
  return {
    id,
    teamName,
    mode,
    picks: [],
    rerollsRemaining: INITIAL_REROLLS,
    lockedPlayerIds: [],
    language,
    currentSpin: initialSpin,
  };
}

export function applyReroll(gameState: GameState, newSpin: Spin): GameState {
  if (gameState.rerollsRemaining <= 0) return gameState;
  return {
    ...gameState,
    rerollsRemaining: gameState.rerollsRemaining - 1,
    currentSpin: newSpin,
  };
}

export function applyPick(
  gameState: GameState,
  appearance: PlayerAppearance,
  nextSpin: Spin | null,
): GameState {
  const pick = {
    round: gameState.picks.length + 1,
    country: gameState.currentSpin!.country,
    worldCup: gameState.currentSpin!.worldCup,
    selectedAppearanceId: appearance.id,
    selectedPlayerId: appearance.playerId,
  };
  return {
    ...gameState,
    picks: [...gameState.picks, pick],
    lockedPlayerIds: [...gameState.lockedPlayerIds, appearance.playerId],
    currentSpin: nextSpin,
  };
}
