"use client";

import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { loadData, getAppearancesById } from "@/lib/data";
import { getPositionCountsFromPicks, getPositionUrgency } from "@/lib/draft";
import { TOTAL_PICKS } from "@/types/game";
import { t } from "@/lib/i18n";
import { TeamBuilderPanel } from "./TeamBuilderPanel";
import { CountryFlag } from "./CountryFlag";
import { PlayerCard } from "./PlayerCard";

export function DraftScreen() {
  const { gameState, eligible, reroll, selectPlayer, locale, mode } = useGame();
  const indexes = useMemo(() => loadData(), []);
  const appearancesById = useMemo(() => getAppearancesById(), []);

  if (!gameState?.currentSpin) return null;

  const pickNum = gameState.picks.length + 1;
  const picksLeft = TOTAL_PICKS - gameState.picks.length;
  const counts = getPositionCountsFromPicks(
    gameState.picks,
    indexes.playersById,
    appearancesById,
  );
  const urgency = getPositionUrgency(counts, picksLeft, locale);
  const spin = gameState.currentSpin;

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

      <TeamBuilderPanel gameState={gameState} locale={locale} />

      {urgency && (
        <p className="rounded-lg border border-amber-600/40 bg-amber-900/20 px-3 py-2 text-center text-xs font-semibold text-amber-200">
          {urgency}
        </p>
      )}

      <div className="paper-texture rounded-2xl border-2 border-amber-800/30 p-4 text-center">
        <div className="flex justify-center">
          <CountryFlag country={spin.country} size={48} />
        </div>
        <div className="mt-2 text-xl font-black text-amber-950">
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
