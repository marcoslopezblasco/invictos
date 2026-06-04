"use client";

import { useGame } from "@/context/GameContext";
import { t } from "@/lib/i18n";
import { setSavedMode } from "@/lib/storage";
import type { GameMode } from "@/types/simulation";

const MODES: GameMode[] = ["classic", "blind", "historico", "hardcore"];

function modeLabelKey(
  m: GameMode,
): "home.classic" | "home.blind" | "home.historico" | "home.hardcore" {
  if (m === "classic") return "home.classic";
  if (m === "blind") return "home.blind";
  if (m === "historico") return "home.historico";
  return "home.hardcore";
}

export function ModeSelector() {
  const { mode, setMode, locale } = useGame();

  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1 sm:grid-cols-4">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => {
            setMode(m);
            setSavedMode(m);
          }}
          className={`flex-1 rounded-lg px-2 py-2.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${
            mode === m
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-muted)] hover:text-white"
          }`}
        >
          {t(locale, modeLabelKey(m))}
        </button>
      ))}
    </div>
  );
}
