"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getInitialSpin, loadData } from "@/lib/data";
import { t } from "@/lib/i18n";
import { TeamBuilderPanel } from "./TeamBuilderPanel";
import { SpinSlotMachine } from "./SpinSlotMachine";

export function InitialRollScreen() {
  const { gameState, locale, mode, commitInitialSpin } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [target, setTarget] = useState<{ country: string; worldCup: number } | null>(
    null,
  );

  const pool = useMemo(() => loadData().countryCupCombos, []);

  if (!gameState) return null;

  const handleRoll = () => {
    const spin = getInitialSpin(gameState.id);
    setTarget(spin);
    setSpinning(true);
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div className="text-center">
        <p className="text-sm font-bold text-[var(--accent-gold)]">
          {t(locale, "draft.pick")} 1/11
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {spinning ? t(locale, "draft.rolling") : t(locale, "draft.rollHint")}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {mode === "blind"
            ? t(locale, "home.blind")
            : mode === "historico"
              ? t(locale, "home.historico")
              : t(locale, "home.classic")}
        </p>
      </div>

      <TeamBuilderPanel gameState={gameState} locale={locale} />

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
        <button
          type="button"
          onClick={handleRoll}
          className="rounded-2xl bg-[var(--accent-gold)] py-5 text-2xl font-black tracking-widest text-black shadow-lg transition active:scale-[0.98]"
        >
          {t(locale, "draft.roll")}
        </button>
      )}
    </div>
  );
}
