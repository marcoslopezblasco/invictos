"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getInitialSpin, loadData } from "@/lib/data";
import { buildSpinPool, isHardcoreMode } from "@/lib/draft";
import { t } from "@/lib/i18n";
import { TeamBuilderPanel } from "./TeamBuilderPanel";
import { SpinSlotMachine } from "./SpinSlotMachine";

export function InitialRollScreen() {
  const { gameState, locale, mode, commitInitialSpin } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [target, setTarget] = useState<{ country: string; worldCup: number } | null>(
    null,
  );

  const indexes = useMemo(() => loadData(), []);
  const pool = useMemo(
    () => (gameState ? buildSpinPool(gameState, indexes) : indexes.countryCupCombos),
    [gameState, indexes],
  );

  if (!gameState) return null;

  const handleRoll = () => {
    const spin = getInitialSpin(gameState, indexes);
    setTarget(spin);
    setSpinning(true);
  };

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
      <div className="text-center">
        <p className="text-sm font-bold text-[var(--accent-gold)]">
          {t(locale, "draft.pick")} 1/11
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {mode === "blind"
            ? t(locale, "home.blind")
            : mode === "historico"
              ? t(locale, "home.historico")
              : mode === "hardcore"
                ? t(locale, "home.hardcore")
                : t(locale, "home.classic")}
        </p>
        {isHardcoreMode(mode) && (
          <p className="mt-2 text-[22px] leading-snug text-[var(--text-muted)]">
            {t(locale, "draft.hardcoreHint")}
          </p>
        )}
      </div>

      <TeamBuilderPanel gameState={gameState} locale={locale} />

      <div className="flex items-stretch gap-2">
        {spinning && target ? (
          <SpinSlotMachine
            target={target}
            pool={pool}
            active
            onComplete={() => {
              commitInitialSpin(target);
              setSpinning(false);
            }}
          />
        ) : (
          <div className="flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--border)] px-2 py-1.5">
            <p className="text-center text-xs text-[var(--text-muted)]">
              {t(locale, "draft.rollHint")}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleRoll}
          disabled={spinning}
          className="shrink-0 rounded-xl bg-[var(--accent-gold)] px-5 py-2 text-sm font-black tracking-wide text-black shadow-md transition active:scale-[0.98] disabled:opacity-50"
        >
          {spinning ? t(locale, "draft.rolling") : t(locale, "draft.roll")}
        </button>
      </div>
    </div>
  );
}
