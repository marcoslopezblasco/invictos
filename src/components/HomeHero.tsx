"use client";

import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { modeLabelKey, t, tFormat } from "@/lib/i18n";
import { ModeSelector } from "./ModeSelector";
import { LanguageToggle } from "./LanguageToggle";

export function HomeHero() {
  const { locale, mode } = useGame();

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-10 text-center">
      <div className="flex w-full max-w-md justify-start">
        <LanguageToggle />
      </div>

      <div>
        <h1 className="text-4xl font-black tracking-tight text-[var(--accent-gold)]">
          {t(locale, "app.title")}
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-[var(--text-muted)]">
          {t(locale, "app.claim")}
        </p>
      </div>

      <ModeSelector />

      <Link
        href="/play"
        className="w-full max-w-md rounded-2xl bg-[var(--accent)] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
      >
        {tFormat(locale, "home.playAs", {
          mode: t(locale, modeLabelKey(mode)),
        })}
      </Link>

      <Link
        href="/how"
        className="text-sm text-[var(--text-muted)] underline underline-offset-4"
      >
        {t(locale, "home.how")}
      </Link>
    </div>
  );
}
