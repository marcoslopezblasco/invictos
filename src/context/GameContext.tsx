"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GameState, Spin } from "@/types/game";
import type { PlayerAppearance } from "@/types/player";
import type { GameMode, Language } from "@/types/simulation";
import { TOTAL_PICKS } from "@/types/game";
import { loadData, getInitialSpin, getAppearancesById } from "@/lib/data";
import {
  applyPick,
  applyReroll,
  createInitialGameState,
  generateSpin,
  getEligibleAppearances,
  picksToDrafted,
} from "@/lib/draft";
import { pickRandomTeamName } from "@/lib/i18n";
import { getTeamName, setTeamName } from "@/lib/storage";
import { simulateTournament } from "@/lib/simulation";
import {
  clearActiveGame,
  saveActiveGame,
  saveResult,
  type SavedResult,
} from "@/lib/storage";

interface GameContextValue {
  locale: Language;
  setLocale: (l: Language) => void;
  mode: GameMode;
  setMode: (m: GameMode) => void;
  gameState: GameState | null;
  eligible: PlayerAppearance[];
  startGame: (teamName?: string) => void;
  /** Clear active run and return user to home (mode selection). */
  exitToHome: () => void;
  rollInitialSpin: () => void;
  commitInitialSpin: (spin: Spin) => void;
  commitReroll: (spin: Spin) => void;
  previewRerollSpin: () => Spin | null;
  restoreGame: (state: GameState) => void;
  reroll: () => void;
  needsInitialRoll: boolean;
  selectPlayer: (appearanceId: string) => void;
  runSimulation: () => SavedResult | null;
  isDraftComplete: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

function newGameId(): string {
  return `game-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function GameProvider({
  children,
  initialLocale,
  initialMode,
}: {
  children: ReactNode;
  initialLocale: Language;
  initialMode: GameMode;
}) {
  const [locale, setLocale] = useState<Language>(initialLocale);
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [spinCounter, setSpinCounter] = useState(0);

  const indexes = useMemo(() => loadData(), []);
  const appearancesById = useMemo(() => getAppearancesById(), []);

  const eligible = useMemo(() => {
    if (!gameState?.currentSpin) return [];
    const locked = new Set(gameState.lockedPlayerIds);
    return getEligibleAppearances(gameState.currentSpin, locked, indexes);
  }, [gameState, indexes]);

  const startGame = useCallback(
    (teamName?: string) => {
      const id = newGameId();
      const name =
        teamName?.trim() ||
        getTeamName()?.trim() ||
        pickRandomTeamName(locale);
      setTeamName(name);
      const state = createInitialGameState(id, name, mode, locale, null);
      setGameState(state);
      setSpinCounter(0);
      saveActiveGame({ gameStateJson: JSON.stringify(state) });
    },
    [mode, locale],
  );

  const exitToHome = useCallback(() => {
    clearActiveGame();
    setGameState(null);
    setSpinCounter(0);
  }, []);

  const commitInitialSpin = useCallback(
    (spin: Spin) => {
      if (!gameState || gameState.currentSpin) return;
      const next = { ...gameState, currentSpin: spin };
      setGameState(next);
      saveActiveGame({ gameStateJson: JSON.stringify(next) });
    },
    [gameState],
  );

  const rollInitialSpin = useCallback(() => {
    if (!gameState || gameState.currentSpin) return;
    commitInitialSpin(getInitialSpin(gameState, indexes));
  }, [gameState, commitInitialSpin, indexes]);

  const previewRerollSpin = useCallback((): Spin | null => {
    if (!gameState || gameState.rerollsRemaining <= 0) return null;
    return generateSpin(gameState, indexes, spinCounter + 1);
  }, [gameState, indexes, spinCounter]);

  const commitReroll = useCallback(
    (spin: Spin) => {
      if (!gameState || gameState.rerollsRemaining <= 0) return;
      const next = applyReroll(gameState, spin);
      setGameState(next);
      setSpinCounter((c) => c + 1);
      saveActiveGame({ gameStateJson: JSON.stringify(next) });
    },
    [gameState],
  );

  const restoreGame = useCallback((state: GameState) => {
    setGameState(state);
    setSpinCounter(state.picks.length);
  }, []);

  const reroll = useCallback(() => {
    if (!gameState || gameState.rerollsRemaining <= 0) return;
    const nextSpin = generateSpin(gameState, indexes, spinCounter + 1);
    const next = applyReroll(gameState, nextSpin);
    setGameState(next);
    setSpinCounter((c) => c + 1);
    saveActiveGame({ gameStateJson: JSON.stringify(next) });
  }, [gameState, indexes, spinCounter]);

  const selectPlayer = useCallback(
    (appearanceId: string) => {
      if (!gameState?.currentSpin) return;
      const appearance = appearancesById.get(appearanceId);
      const player = indexes.playersById.get(appearance?.playerId ?? "");
      if (!appearance || !player) return;

      const picksLeft = TOTAL_PICKS - gameState.picks.length - 1;
      const picksIncludingThis = [
        ...gameState.picks,
        {
          round: gameState.picks.length + 1,
          country: gameState.currentSpin.country,
          worldCup: gameState.currentSpin.worldCup,
          selectedAppearanceId: appearance.id,
          selectedPlayerId: appearance.playerId,
        },
      ];
      const nextSpin =
        picksLeft > 0
          ? generateSpin(
              { ...gameState, picks: picksIncludingThis },
              indexes,
              spinCounter + 1,
            )
          : null;

      const next = applyPick(gameState, appearance, player, nextSpin);
      setGameState(next);
      setSpinCounter((c) => c + 1);
      if (next.picks.length >= TOTAL_PICKS) {
        clearActiveGame();
      } else {
        saveActiveGame({ gameStateJson: JSON.stringify(next) });
      }
    },
    [gameState, appearancesById, indexes, spinCounter],
  );

  const runSimulation = useCallback((): SavedResult | null => {
    if (!gameState || gameState.picks.length < TOTAL_PICKS) return null;
    const drafted = picksToDrafted(
      gameState.picks,
      appearancesById,
      indexes.playersById,
    );
    if (drafted.length < TOTAL_PICKS) return null;

    const tournament = simulateTournament(
      gameState.teamName,
      drafted,
      gameState.language,
      gameState.mode,
    );

    const appearances = drafted.map((d) => d.appearance);
    const saved: SavedResult = {
      id: gameState.id,
      teamName: gameState.teamName,
      mode: gameState.mode,
      language: gameState.language,
      formation: tournament.formation,
      badge: tournament.badge,
      score: tournament.score,
      tournament,
      picks: gameState.picks,
      appearances,
      timestamp: Date.now(),
    };
    saveResult(saved);
    return saved;
  }, [gameState, appearancesById, indexes]);

  const value: GameContextValue = {
    locale,
    setLocale,
    mode,
    setMode,
    gameState,
    eligible,
    startGame,
    exitToHome,
    rollInitialSpin,
    commitInitialSpin,
    commitReroll,
    previewRerollSpin,
    restoreGame,
    needsInitialRoll: Boolean(gameState && !gameState.currentSpin),
    reroll,
    selectPlayer,
    runSimulation,
    isDraftComplete: (gameState?.picks.length ?? 0) >= TOTAL_PICKS,
  };

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
