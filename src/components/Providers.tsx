"use client";

import { GameProvider } from "@/context/GameContext";
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
      {children}
    </GameProvider>
  );
}
