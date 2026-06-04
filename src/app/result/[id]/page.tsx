"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getResultById, type SavedResult } from "@/lib/storage";
import { SimulationResult } from "@/components/SimulationResult";
import { ShareCard } from "@/components/ShareCard";
import { FormationPitch } from "@/components/FormationPitch";
import { t, tFormat } from "@/lib/i18n";
import { draftedFromSavedResult } from "@/lib/result-draft";
import { useGame } from "@/context/GameContext";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { locale: ctxLocale, exitToHome } = useGame();
  const [result, setResult] = useState<SavedResult | null>(null);

  useEffect(() => {
    setResult(getResultById(id));
  }, [id]);

  const drafted = useMemo(
    () => (result ? draftedFromSavedResult(result) : []),
    [result],
  );

  if (!result) {
    return (
      <div className="px-4 py-10 text-center text-[var(--text-muted)]">
        {t(ctxLocale, "result.notFound")}
        <Link href="/" className="mt-4 block text-[var(--accent)]">
          {t(ctxLocale, "nav.home")}
        </Link>
      </div>
    );
  }

  const locale = result.language ?? ctxLocale;
  const tr = result.tournament;
  const gd =
    tr.goalDifference >= 0 ? `+${tr.goalDifference}` : `${tr.goalDifference}`;

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <Link href="/" className="text-sm text-[var(--text-muted)]">
        ← {t(locale, "app.title")}
      </Link>

      <div>
        <h1 className="text-2xl font-black">{result.teamName}</h1>
        <p className="text-lg font-bold text-[var(--accent-gold)]">
          {result.formation}
        </p>
      </div>

      <FormationPitch drafted={drafted} />

      <div className="rounded-2xl border border-[var(--accent-gold)]/40 bg-[var(--bg-card)] p-4 text-center">
        <div className="text-sm text-[var(--text-muted)]">
          {t(locale, "result.score")}
        </div>
        <div className="text-4xl font-black text-[var(--accent-gold)]">
          {result.score}
        </div>
        <div className="mt-1 text-lg font-bold">
          {t(locale, `badge.${result.badge}`)}
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {t(locale, `badge.hint.${result.badge}`)}
        </p>
        <p className="mt-3 font-mono text-xs">
          {tFormat(locale, "result.statsLine", {
            played: tr.played,
            wins: tr.wins,
            draws: tr.draws,
            losses: tr.losses,
          })}
        </p>
        <p className="font-mono text-xs">
          {tFormat(locale, "result.goalsLine", {
            gf: tr.goalsFor,
            gc: tr.goalsAgainst,
            gd,
          })}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-[var(--text-muted)]">
        {tr.narrative}
      </p>

      <SimulationResult
        tournament={tr}
        locale={locale}
        mode={result.mode}
        teamName={result.teamName}
        drafted={drafted}
      />
      <ShareCard result={result} />

      <button
        type="button"
        onClick={() => {
          exitToHome();
          router.push("/");
        }}
        className="w-full rounded-2xl bg-[var(--accent)] py-4 text-lg font-bold text-white"
      >
        {t(locale, "result.playAgain")}
      </button>
    </div>
  );
}
