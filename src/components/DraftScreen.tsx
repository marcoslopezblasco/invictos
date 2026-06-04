"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { loadData, getAppearancesById } from "@/lib/data";
import {
  buildSpinPool,
  filterAndSortEligible,
  getPositionCountsFromPicks,
  getPositionUrgency,
  isHardcoreMode,
  picksToDrafted,
  type EligibleSort,
  type PositionFilter,
} from "@/lib/draft";
import { TOTAL_PICKS } from "@/types/game";
import type { Spin } from "@/types/game";
import { t } from "@/lib/i18n";
import { TeamBuilderPanel } from "./TeamBuilderPanel";
import { PlayerCard } from "./PlayerCard";
import { SpinSlotMachine } from "./SpinSlotMachine";

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
  const {
    gameState,
    eligible,
    selectPlayer,
    locale,
    mode,
    previewRerollSpin,
    commitReroll,
  } = useGame();
  const indexes = useMemo(() => loadData(), []);
  const pool = useMemo(() => indexes.countryCupCombos, [indexes]);
  const appearancesById = useMemo(() => getAppearancesById(), []);
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("ALL");
  const [sortBy, setSortBy] = useState<EligibleSort>("fit");
  const [spinAnim, setSpinAnim] = useState<{
    active: boolean;
    target: Spin;
    onDone: () => void;
  } | null>(null);

  const spin = gameState?.currentSpin;
  const prevSpinKey = useRef<string | null>(null);
  const skipNextSpinEffect = useRef(false);

  useLayoutEffect(() => {
    if (!spin || !gameState) return;
    const key = `${spin.country}::${spin.worldCup}::${gameState.picks.length}`;
    if (skipNextSpinEffect.current) {
      skipNextSpinEffect.current = false;
      prevSpinKey.current = key;
      return;
    }
    if (prevSpinKey.current === null) {
      prevSpinKey.current = key;
      return;
    }
    if (prevSpinKey.current === key) return;
    prevSpinKey.current = key;
    setSpinAnim({
      active: true,
      target: spin,
      onDone: () => setSpinAnim(null),
    });
  }, [spin, gameState]);

  if (!gameState?.currentSpin || !spin) return null;

  const pickNum = gameState.picks.length + 1;
  const picksLeft = TOTAL_PICKS - gameState.picks.length;
  const counts = getPositionCountsFromPicks(
    gameState.picks,
    indexes.playersById,
    appearancesById,
  );
  const urgency = getPositionUrgency(counts, picksLeft, locale);
  const isRolling = spinAnim?.active ?? false;

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

  const handleReroll = () => {
    const targetSpin = previewRerollSpin();
    if (!targetSpin) return;
    setSpinAnim({
      active: true,
      target: targetSpin,
      onDone: () => {
        skipNextSpinEffect.current = true;
        commitReroll(targetSpin);
        setSpinAnim(null);
      },
    });
  };

  const showSpin = spinAnim ?? { active: false, target: spin, onDone: () => {} };

  return (
    <div className="flex flex-col gap-3 px-4 pb-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--accent-gold)]">
          {t(locale, "draft.pick")} {pickNum}/{TOTAL_PICKS}
        </span>
        <span className="text-sm text-[var(--text-muted)]">
          {t(locale, "draft.rerolls")}: {gameState.rerollsRemaining}
        </span>
      </div>

      <TeamBuilderPanel gameState={gameState} locale={locale} />

      {isHardcoreMode(mode) && (
        <p className="text-center text-[22px] leading-snug text-[var(--text-muted)]">
          {t(locale, "draft.hardcoreHint")}
        </p>
      )}

      {urgency && !isRolling && (
        <p className="rounded-lg border border-amber-600/40 bg-amber-900/20 px-3 py-2 text-center text-xs font-semibold text-amber-200">
          {urgency}
        </p>
      )}

      <div className="flex items-stretch gap-2">
        <SpinSlotMachine
          target={showSpin.target}
          pool={pool}
          active={showSpin.active}
          onComplete={showSpin.onDone}
        />
        <button
          type="button"
          disabled={gameState.rerollsRemaining <= 0 || isRolling}
          onClick={handleReroll}
          className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          {isRolling ? t(locale, "draft.rolling") : t(locale, "draft.reroll")}
        </button>
      </div>

      {isRolling ? (
        <p className="py-3 text-center text-xs font-semibold text-[var(--text-muted)]">
          {t(locale, "draft.rolling")}
        </p>
      ) : (
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            {t(locale, "draft.filter")}
          </span>
          <div className="flex flex-wrap gap-1">
            {POSITION_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                disabled={isRolling}
                onClick={() => setPositionFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
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

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            {t(locale, "draft.sort")}
          </span>
          <div className="flex flex-wrap gap-1">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={isRolling}
                onClick={() => setSortBy(s)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
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

        <p className="text-xs font-semibold text-[var(--text-muted)]">
          {t(locale, "draft.choose")}
          {displayed.length !== eligible.length && (
            <span className="ml-1 text-[var(--accent-gold)]">
              ({displayed.length})
            </span>
          )}
        </p>

        <div className="flex flex-col gap-1">
          {displayed.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-center text-xs text-[var(--text-muted)]">
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
      )}
    </div>
  );
}
