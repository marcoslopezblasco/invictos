"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { modeLabelKey, pickRandomTeamName, t } from "@/lib/i18n";
import { getTeamName, setTeamName } from "@/lib/storage";
import type { Language } from "@/types/simulation";

export function TeamNameScreen({
  locale,
  onStart,
}: {
  locale: Language;
  onStart: (teamName: string) => void;
}) {
  const { mode } = useGame();
  const [name, setName] = useState(() => getTeamName() ?? "");

  const handleStart = () => {
    const trimmed = name.trim() || pickRandomTeamName(locale);
    setTeamName(trimmed);
    onStart(trimmed);
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-10">
      <h1 className="text-center text-xl font-bold">{t(locale, "name.title")}</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t(locale, "name.placeholder")}
        maxLength={48}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-center text-lg font-semibold outline-none focus:border-[var(--accent-gold)]/60"
        autoComplete="off"
        enterKeyHint="go"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleStart();
        }}
      />
      <button
        type="button"
        onClick={handleStart}
        className="w-full rounded-2xl bg-[var(--accent)] py-4 text-lg font-bold text-white shadow-lg transition active:scale-[0.98]"
      >
        {t(locale, "name.start")}
      </button>
      <button
        type="button"
        onClick={() => setName(pickRandomTeamName(locale))}
        className="text-sm text-[var(--text-muted)] underline underline-offset-4"
      >
        {t(locale, "name.random")}
      </button>
      <p className="text-center text-xs text-[var(--text-muted)]">
        {t(locale, modeLabelKey(mode))}
      </p>
    </div>
  );
}
