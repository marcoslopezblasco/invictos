"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GameState } from "@/types/game";
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
  playAgain: () => void;
  rollInitialSpin: () => void;
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
      const name = teamName?.trim() || pickRandomTeamName(locale);
      const state = createInitialGameState(id, name, mode, locale, null);
      setGameState(state);
      setSpinCounter(0);
      saveActiveGame({ gameStateJson: JSON.stringify(state) });
    },
    [mode, locale],
  );

  const playAgain = useCallback(() => {
    clearActiveGame();
    const id = newGameId();
    const name = pickRandomTeamName(locale);
    const state = createInitialGameState(id, name, mode, locale, null);
    setGameState(state);
    setSpinCounter(0);
    saveActiveGame({ gameStateJson: JSON.stringify(state) });
  }, [mode, locale]);

  const rollInitialSpin = useCallback(() => {
    if (!gameState || gameState.currentSpin) return;
    const spin = getInitialSpin(gameState.id);
    const next = { ...gameState, currentSpin: spin };
    setGameState(next);
    saveActiveGame({ gameStateJson: JSON.stringify(next) });
  }, [gameState]);

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
      const nextSpin =
        picksLeft > 0
          ? generateSpin(
              { ...gameState, picks: [...gameState.picks] },
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
    playAgain,
    rollInitialSpin,
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
