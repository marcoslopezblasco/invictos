"use client";

import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { loadData } from "@/lib/data";
import { getPositionCountsFromPicks } from "@/lib/draft";
import { TOTAL_PICKS } from "@/types/game";
import { t } from "@/lib/i18n";
import { getFlagForCountry } from "@/lib/data";
import { PositionSlots } from "./PositionSlots";
import { PlayerCard } from "./PlayerCard";

export function DraftScreen() {
  const { gameState, eligible, reroll, selectPlayer, locale, mode } = useGame();
  const indexes = useMemo(() => loadData(), []);

  if (!gameState?.currentSpin) return null;

  const pickNum = gameState.picks.length + 1;
  const counts = getPositionCountsFromPicks(
    gameState.picks,
    indexes.playersById,
  );
  const spin = gameState.currentSpin;
  const flag = getFlagForCountry(spin.country);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--accent-gold)]">
          {t(locale, "draft.pick")} {pickNum}/{TOTAL_PICKS}
        </span>
        <span className="text-sm text-[var(--text-muted)]">
          {t(locale, "draft.rerolls")}: {gameState.rerollsRemaining}
        </span>
      </div>

      <PositionSlots counts={counts} locale={locale} />

      <div className="paper-texture rounded-2xl border-2 border-amber-800/30 p-4 text-center">
        <div className="text-3xl">{flag}</div>
        <div className="text-xl font-black text-amber-950">
          {spin.country} {spin.worldCup}
        </div>
      </div>

      <button
        type="button"
        disabled={gameState.rerollsRemaining <= 0}
        onClick={reroll}
        className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-3 text-sm font-semibold disabled:opacity-40"
      >
        {t(locale, "draft.reroll")}
      </button>

      <p className="text-sm font-semibold text-[var(--text-muted)]">
        {t(locale, "draft.choose")}
      </p>

      <div className="flex flex-col gap-2">
        {eligible.map((app) => {
          const player = indexes.playersById.get(app.playerId);
          if (!player) return null;
          return (
            <PlayerCard
              key={app.id}
              appearance={app}
              player={player}
              mode={mode}
              onSelect={() => selectPlayer(app.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
