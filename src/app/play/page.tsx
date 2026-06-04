"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { DraftScreen } from "@/components/DraftScreen";
import { InitialRollScreen } from "@/components/InitialRollScreen";
import { t } from "@/lib/i18n";
import { setSavedMode, getActiveGame } from "@/lib/storage";
import type { GameState } from "@/types/game";
import { TOTAL_PICKS } from "@/types/game";

export default function PlayPage() {
  const router = useRouter();
  const {
    locale,
    mode,
    gameState,
    startGame,
    restoreGame,
    isDraftComplete,
    needsInitialRoll,
  } = useGame();
  const booted = useRef(false);

  useEffect(() => {
    setSavedMode(mode);
  }, [mode]);

  useEffect(() => {
    if (booted.current || gameState) return;

    const session = getActiveGame();
    if (session?.gameStateJson) {
      try {
        const restored = JSON.parse(session.gameStateJson) as GameState;
        if (restored.picks.length < TOTAL_PICKS) {
          restoreGame(restored);
          booted.current = true;
          return;
        }
      } catch {
        /* ignore */
      }
    }

    startGame();
    booted.current = true;
  }, [gameState, restoreGame, startGame]);

  useEffect(() => {
    if (isDraftComplete) {
      router.push("/play/review");
    }
  }, [isDraftComplete, router]);

  if (!gameState) {
    return (
      <div className="px-4 py-10 text-center text-[var(--text-muted)]">
        {t(locale, "home.play")}…
      </div>
    );
  }

  if (gameState.picks.length >= TOTAL_PICKS) {
    return null;
  }

  if (needsInitialRoll) {
    return <InitialRollScreen />;
  }

  return (
    <div className="py-4">
      <DraftScreen />
    </div>
  );
}
