"use client";

import { useGame } from "@/context/GameContext";
import { t } from "@/lib/i18n";
import { TeamBuilderPanel } from "./TeamBuilderPanel";

export function InitialRollScreen() {
  const { gameState, locale, mode, rollInitialSpin } = useGame();

  if (!gameState) return null;

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div className="text-center">
        <p className="text-sm font-bold text-[var(--accent-gold)]">
          {t(locale, "draft.pick")} 1/11
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {t(locale, "draft.rollHint")}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {mode === "classic" ? t(locale, "home.classic") : t(locale, "home.blind")}
        </p>
      </div>

      <TeamBuilderPanel gameState={gameState} locale={locale} />

      <button
        type="button"
        onClick={rollInitialSpin}
        className="rounded-2xl bg-[var(--accent-gold)] py-5 text-2xl font-black tracking-widest text-black shadow-lg transition active:scale-[0.98]"
      >
        {t(locale, "draft.roll")}
      </button>
    </div>
  );
}
