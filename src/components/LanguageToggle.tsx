"use client";

import { useGame } from "@/context/GameContext";
import { setLocale as persistLocale } from "@/lib/storage";

export function LanguageToggle() {
  const { locale, setLocale } = useGame();

  return (
    <div className="flex gap-1 rounded-lg border border-[var(--border)] p-0.5 text-xs font-bold">
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => {
            setLocale(l);
            persistLocale(l);
          }}
          className={`rounded-md px-3 py-1.5 uppercase ${
            locale === l ? "bg-[var(--accent-gold)] text-black" : "text-[var(--text-muted)]"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
