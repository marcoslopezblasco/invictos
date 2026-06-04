"use client";

import { useEffect, useState } from "react";
import { Providers } from "./Providers";
import { detectLanguage } from "@/lib/i18n";
import { getLocale, getSavedMode } from "@/lib/storage";
import type { GameMode, Language } from "@/types/simulation";

export function ClientAppShell({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Language | null>(null);
  const [mode, setMode] = useState<GameMode>("classic");

  useEffect(() => {
    setLocale(getLocale() ?? detectLanguage());
    setMode(getSavedMode() ?? "classic");
  }, []);

  if (!locale) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-[var(--text-muted)]"
        aria-busy="true"
      >
        …
      </div>
    );
  }

  return (
    <Providers locale={locale} mode={mode}>
      <main className="mx-auto min-h-screen w-full max-w-lg">{children}</main>
    </Providers>
  );
}
