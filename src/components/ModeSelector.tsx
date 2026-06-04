"use client";

import { useGame } from "@/context/GameContext";
import { t } from "@/lib/i18n";
import { setSavedMode } from "@/lib/storage";

export function ModeSelector() {
  const { mode, setMode, locale } = useGame();

  return (
    <div className="flex gap-2 rounded-xl bg-[var(--bg-card)] p-1 border border-[var(--border)]">
      {(["classic", "blind"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => {
            setMode(m);
            setSavedMode(m);
          }}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            mode === m
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-muted)] hover:text-white"
          }`}
        >
          {t(locale, m === "classic" ? "home.classic" : "home.blind")}
        </button>
      ))}
    </div>
  );
}
