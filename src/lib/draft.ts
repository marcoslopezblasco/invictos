import type { Country, Player, PlayerAppearance, Position } from "@/types/player";
import type { GameMode } from "@/types/simulation";
import type { GameState, PositionCounts, Spin } from "@/types/game";
import {
  INITIAL_REROLLS,
  POSITION_MINIMUMS,
  TOTAL_PICKS,
} from "@/types/game";
import type { DraftedPlayer } from "@/types/simulation";
import { calculateMarginalContribution } from "./scoring";
import { stableHash } from "./hash";
import { formatPositionUrgency } from "./i18n";
import type { Language } from "@/types/simulation";

export interface DataIndexes {
  countries: Country[];
  appearancesByCountryCup: Map<string, PlayerAppearance[]>;
  playersById: Map<string, Player>;
  countryCupCombos: Spin[];
}

function comboKey(country: string, worldCup: number): string {
  return `${country}::${worldCup}`;
}

export function isHardcoreMode(mode: GameMode): boolean {
  return mode === "hardcore";
}

export function getUsedCountries(picks: GameState["picks"]): Set<string> {
  return new Set(picks.map((p) => p.country));
}

/** Hardcore: drop country+WC combos for nations already represented on the XI. */
export function filterCombosForGame(combos: Spin[], gameState: GameState): Spin[] {
  if (!isHardcoreMode(gameState.mode)) return combos;
  const used = getUsedCountries(gameState.picks);
  if (used.size === 0) return combos;
  const filtered = combos.filter((c) => !used.has(c.country));
  return filtered.length > 0 ? filtered : combos;
}

export function buildSpinPool(gameState: GameState, indexes: DataIndexes): Spin[] {
  const locked = new Set(gameState.lockedPlayerIds);
  const counts = getPositionCountsFromPicks(gameState.picks);
  const picksLeft = picksRemaining(gameState);
  const forced = getForcedPosition(counts, picksLeft);
  let pool = filterCombosForGame(indexes.countryCupCombos, gameState);

  if (forced) {
    const filtered = combosWithPosition(pool, indexes, forced, locked);
    if (filtered.length > 0) pool = filtered;
  }

  return pool.length > 0 ? pool : filterCombosForGame(indexes.countryCupCombos, gameState);
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

function resolveAssignedPosition(
  pick: GameState["picks"][number],
  playersById?: Map<string, Player>,
  appearancesById?: Map<string, PlayerAppearance>,
): Position {
  if (pick.assignedPosition) return pick.assignedPosition;
  const player = playersById?.get(pick.selectedPlayerId);
  const app = appearancesById?.get(pick.selectedAppearanceId);
  return player?.position ?? app?.position ?? "MID";
}

export function getPositionCountsFromPicks(
  picks: GameState["picks"],
  playersById?: Map<string, Player>,
  appearancesById?: Map<string, PlayerAppearance>,
): PositionCounts {
  const counts: PositionCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const pick of picks) {
    counts[resolveAssignedPosition(pick, playersById, appearancesById)]++;
  }
  return counts;
}

const ALL_POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"];

/** Positions the user may assign on this pick without making the XI impossible to complete. */
export function getValidAssignedPositions(
  counts: PositionCounts,
  picksLeft: number,
): Position[] {
  if (picksLeft <= 0) return [];
  return ALL_POSITIONS.filter((pos) => {
    const next: PositionCounts = { ...counts, [pos]: counts[pos] + 1 };
    return canStillSatisfyMinimums(next, picksLeft - 1);
  });
}

export function getPositionUrgency(
  counts: PositionCounts,
  picksLeft: number,
  locale: Language,
): string | null {
  const forced = getForcedPosition(counts, picksLeft);
  if (!forced) return null;
  const need = POSITION_MINIMUMS[forced] - counts[forced];
  return formatPositionUrgency(locale, forced, need, picksLeft);
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
  const pool = buildSpinPool(gameState, indexes);
  const fallback = indexes.countryCupCombos;

  const seed = `${gameState.id}-${gameState.picks.length}-${spinIndex}`;
  const idx = stableHash(seed) % pool.length;
  return pool[idx] ?? fallback[0]!;
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

export type EligibleSort = "fit" | "ovr" | "position";
export type PositionFilter = "ALL" | Position;

const POSITION_ORDER: Record<Position, number> = {
  GK: 0,
  DEF: 1,
  MID: 2,
  FWD: 3,
};

export function filterAndSortEligible(
  appearances: PlayerAppearance[],
  playersById: Map<string, Player>,
  filter: PositionFilter,
  sort: EligibleSort,
  drafted: DraftedPlayer[],
): PlayerAppearance[] {
  let list =
    filter === "ALL"
      ? appearances
      : appearances.filter((a) => a.position === filter);

  if (sort === "fit") {
    return sortEligibleByContribution(list, drafted, playersById);
  }

  if (sort === "ovr") {
    return [...list].sort((a, b) => {
      const oA = playersById.get(a.playerId)?.profile.overall ?? 0;
      const oB = playersById.get(b.playerId)?.profile.overall ?? 0;
      return oB - oA;
    });
  }

  return [...list].sort((a, b) => {
    const byPos = POSITION_ORDER[a.position] - POSITION_ORDER[b.position];
    if (byPos !== 0) return byPos;
    const oA = playersById.get(a.playerId)?.profile.overall ?? 0;
    const oB = playersById.get(b.playerId)?.profile.overall ?? 0;
    return oB - oA;
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
      const assigned = resolveAssignedPosition(pick, playersById, appearancesById);
      return {
        appearance: { ...appearance, position: assigned },
        player,
      };
    })
    .filter((x): x is DraftedPlayer => x !== null);
}

export function createInitialGameState(
  id: string,
  teamName: string,
  mode: GameState["mode"],
  language: GameState["language"],
  initialSpin: Spin | null = null,
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

export function defaultPositionForPlayer(
  appearance: PlayerAppearance,
  player: Player,
): Position {
  return appearance.position ?? player.position;
}

export function applyPick(
  gameState: GameState,
  appearance: PlayerAppearance,
  player: Player,
  nextSpin: Spin | null,
): GameState {
  const assignedPosition = defaultPositionForPlayer(appearance, player);
  const pick = {
    round: gameState.picks.length + 1,
    country: gameState.currentSpin!.country,
    worldCup: gameState.currentSpin!.worldCup,
    selectedAppearanceId: appearance.id,
    selectedPlayerId: appearance.playerId,
    assignedPosition,
  };
  return {
    ...gameState,
    picks: [...gameState.picks, pick],
    lockedPlayerIds: [...gameState.lockedPlayerIds, appearance.playerId],
    currentSpin: nextSpin,
  };
}
