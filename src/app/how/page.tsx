"use client";

import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { t } from "@/lib/i18n";

export default function HowPage() {
  const { locale } = useGame();

  return (
    <div className="px-4 py-8">
      <Link href="/" className="text-sm text-[var(--text-muted)]">
        ← {t(locale, "app.title")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t(locale, "how.title")}</h1>
      <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-muted)]">
        {t(locale, "how.body")}
      </pre>
    </div>
  );
}
