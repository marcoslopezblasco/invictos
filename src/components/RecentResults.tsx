"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentResults, type SavedResult } from "@/lib/storage";
import { useGame } from "@/context/GameContext";
import { t } from "@/lib/i18n";

export function RecentResults() {
  const { locale } = useGame();
  const [results, setResults] = useState<SavedResult[]>([]);

  useEffect(() => {
    setResults(getRecentResults().slice(0, 5));
  }, []);

  if (results.length === 0) return null;

  return (
    <section className="mt-8 w-full max-w-md px-4">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-[var(--text-muted)]">
          {t(locale, "recent.title")}
        </h2>
        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]/80">
          {t(locale, "recent.localOnly")}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {results.map((r) => (
          <li key={r.id}>
            <Link
              href={`/result/${r.id}`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm"
            >
              <span className="font-semibold">{r.teamName}</span>
              <span className="text-[var(--accent-gold)]">
                {r.score} · {t(locale, `badge.${r.badge}`)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
