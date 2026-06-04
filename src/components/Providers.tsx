"use client";

import { GameProvider } from "@/context/GameContext";
import { LocaleLang } from "@/components/LocaleLang";
import type { GameMode, Language } from "@/types/simulation";

export function Providers({
  children,
  locale,
  mode,
}: {
  children: React.ReactNode;
  locale: Language;
  mode: GameMode;
}) {
  return (
    <GameProvider initialLocale={locale} initialMode={mode}>
      <LocaleLang />
      {children}
    </GameProvider>
  );
}
