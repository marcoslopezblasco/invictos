"use client";

import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { t } from "@/lib/i18n";
import type { Language } from "@/types/simulation";

export function PlayHomeButton({ locale }: { locale: Language }) {
  const router = useRouter();
  const { exitToHome } = useGame();

  return (
    <div className="px-4 pt-4">
      <button
        type="button"
        onClick={() => {
          exitToHome();
          router.push("/");
        }}
        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] transition hover:border-[var(--accent-gold)]/50 hover:text-[var(--accent-gold)] active:scale-[0.98]"
      >
        {t(locale, "nav.home")}
      </button>
    </div>
  );
}
