"use client";

import { useGame } from "@/context/GameContext";
import { modeLabelKey, t } from "@/lib/i18n";
import { setSavedMode } from "@/lib/storage";
import type { GameMode } from "@/types/simulation";

const MODES: GameMode[] = ["classic", "blind", "historico", "hardcore"];

function modeDescKey(m: GameMode): string {
  return `home.mode.${m}.desc`;
}

export function ModeSelector() {
  const { mode, setMode, locale } = useGame();

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
        {t(locale, "home.modeLabel")}
      </p>
      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1 sm:grid-cols-4">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setSavedMode(m);
            }}
            className={`rounded-lg px-2 py-2.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${
              mode === m
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:bg-[var(--border)]/40 hover:text-white"
            }`}
          >
            {t(locale, modeLabelKey(m))}
          </button>
        ))}
      </div>
      <div
        className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-left"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-bold text-[var(--accent-gold)]">
          {t(locale, modeLabelKey(mode))}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
          {t(locale, modeDescKey(mode))}
        </p>
      </div>
    </div>
  );
}
