"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { DraftScreen } from "@/components/DraftScreen";
import { t, RANDOM_TEAM_NAMES } from "@/lib/i18n";
import {
  getTeamName,
  setTeamName,
  setSavedMode,
  getActiveGame,
} from "@/lib/storage";
import type { GameState } from "@/types/game";
import { TOTAL_PICKS } from "@/types/game";

export default function PlayPage() {
  const router = useRouter();
  const { locale, mode, gameState, startGame, restoreGame, isDraftComplete } =
    useGame();
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setSavedMode(mode);
    const saved = getTeamName();
    if (saved) setName(saved);
  }, [mode]);

  useEffect(() => {
    if (gameState) setStarted(true);
  }, [gameState]);

  useEffect(() => {
    const session = getActiveGame();
    if (session?.gameStateJson && !gameState) {
      try {
        const restored = JSON.parse(session.gameStateJson) as GameState;
        if (restored.picks.length < TOTAL_PICKS) {
          restoreGame(restored);
          setName(restored.teamName);
          setStarted(true);
        }
      } catch {
        /* ignore */
      }
    }
  }, [gameState, restoreGame]);

  useEffect(() => {
    if (isDraftComplete) {
      router.push("/play/review");
    }
  }, [isDraftComplete, router]);

  const handleStart = () => {
    const trimmed = name.trim() || t(locale, "name.placeholder");
    setTeamName(trimmed);
    startGame(trimmed);
    setStarted(true);
  };

  const randomName = () => {
    const names = RANDOM_TEAM_NAMES[locale];
    const pick = names[Math.floor(Math.random() * names.length)]!;
    setName(pick);
  };

  if (!started || !gameState) {
    return (
      <div className="flex flex-col gap-6 px-4 py-10">
        <h1 className="text-xl font-bold">{t(locale, "name.title")}</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(locale, "name.placeholder")}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-lg outline-none focus:border-[var(--accent)]"
          maxLength={40}
        />
        <button
          type="button"
          onClick={randomName}
          className="text-sm text-[var(--text-muted)] underline"
        >
          {t(locale, "name.random")}
        </button>
        <button
          type="button"
          onClick={handleStart}
          className="rounded-2xl bg-[var(--accent)] py-4 text-lg font-bold text-white"
        >
          {t(locale, "name.start")}
        </button>
      </div>
    );
  }

  if (gameState.picks.length >= TOTAL_PICKS) {
    return null;
  }

  return (
    <div className="py-4">
      <div className="mb-2 px-4 text-sm font-semibold text-[var(--text-muted)]">
        {gameState.teamName}
      </div>
      <DraftScreen />
    </div>
  );
}
