"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { loadData, getAppearancesById } from "@/lib/data";
import {
  filterAndSortEligible,
  getPositionCountsFromPicks,
  getPositionUrgency,
  picksToDrafted,
  type EligibleSort,
  type PositionFilter,
} from "@/lib/draft";
import { TOTAL_PICKS } from "@/types/game";
import { t } from "@/lib/i18n";
import { TeamBuilderPanel } from "./TeamBuilderPanel";
import { CountryFlag } from "./CountryFlag";
import { PlayerCard } from "./PlayerCard";

const POSITION_FILTERS: PositionFilter[] = ["ALL", "GK", "DEF", "MID", "FWD"];
const SORT_OPTIONS: EligibleSort[] = ["fit", "ovr", "position"];

function positionFilterLabel(locale: Parameters<typeof t>[0], f: PositionFilter): string {
  if (f === "ALL") return t(locale, "draft.filterAll");
  if (f === "FWD") return t(locale, "slots.att");
  return t(locale, `slots.${f.toLowerCase()}` as "slots.gk");
}

function sortLabel(locale: Parameters<typeof t>[0], s: EligibleSort): string {
  if (s === "fit") return t(locale, "draft.sortFit");
  if (s === "ovr") return t(locale, "draft.sortOvr");
  return t(locale, "draft.sortPosition");
}

export function DraftScreen() {
  const { gameState, eligible, reroll, selectPlayer, locale, mode } = useGame();
  const indexes = useMemo(() => loadData(), []);
  const appearancesById = useMemo(() => getAppearancesById(), []);
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("ALL");
  const [sortBy, setSortBy] = useState<EligibleSort>("fit");

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

  const drafted = picksToDrafted(
    gameState.picks,
    appearancesById,
    indexes.playersById,
  );

  const displayed = filterAndSortEligible(
    eligible,
    indexes.playersById,
    positionFilter,
    sortBy,
    drafted,
  );

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

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
          {t(locale, "draft.filter")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POSITION_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setPositionFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                positionFilter === f
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]"
              }`}
            >
              {positionFilterLabel(locale, f)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
          {t(locale, "draft.sort")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSortBy(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                sortBy === s
                  ? "bg-[var(--accent-gold)] text-black"
                  : "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]"
              }`}
            >
              {sortLabel(locale, s)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm font-semibold text-[var(--text-muted)]">
        {t(locale, "draft.choose")}
        {displayed.length !== eligible.length && (
          <span className="ml-1 text-[var(--accent-gold)]">
            ({displayed.length})
          </span>
        )}
      </p>

      <div className="flex flex-col gap-2">
        {displayed.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
            —
          </p>
        ) : (
          displayed.map((app) => {
            const player = indexes.playersById.get(app.playerId);
            if (!player) return null;
            return (
            <PlayerCard
              key={app.id}
              appearance={app}
              player={player}
              mode={mode}
              locale={locale}
              onSelect={() => selectPlayer(app.id)}
            />
            );
          })
        )}
      </div>
    </div>
  );
}
