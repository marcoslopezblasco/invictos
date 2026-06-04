"use client";

import type { Language, MatchResult, MatchStage } from "@/types/simulation";
import { getCountryDisplayName } from "@/lib/data";
import { t } from "@/lib/i18n";
import { CountryFlag } from "./CountryFlag";

const STAGE_LABELS: Record<Language, Record<MatchStage, string>> = {
  es: {
    GROUP_1: "Grupo J1",
    GROUP_2: "Grupo J2",
    GROUP_3: "Grupo J3",
    R16: "Octavos",
    QF: "Cuartos",
    SF: "Semifinal",
    FINAL: "Final",
  },
  en: {
    GROUP_1: "Group M1",
    GROUP_2: "Group M2",
    GROUP_3: "Group M3",
    R16: "Round of 16",
    QF: "Quarter-finals",
    SF: "Semi-final",
    FINAL: "Final",
  },
};

export function getStageLabel(locale: Language, stage: MatchStage): string {
  return STAGE_LABELS[locale][stage] ?? stage;
}

function resultLine(m: MatchResult, locale: Language): string | null {
  const score = `${m.goalsFor}-${m.goalsAgainst}`;
  const penNote =
    m.advancedOnPenalties || m.eliminatedOnPenalties ? " (pen)" : "";
  const icon = m.advancedOnPenalties
    ? "✓"
    : m.eliminatedOnPenalties
      ? "✗"
      : m.result === "W"
        ? "✓"
        : m.result === "D"
          ? "="
          : "✗";
  return `${icon} ${score}${penNote}`;
}

export function MatchSchedule({
  locale,
  matches,
  preview = false,
}: {
  locale: Language;
  matches: MatchResult[];
  preview?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--accent-gold)]">
        {t(locale, preview ? "sim.fixturesPreview" : "sim.fixtures")}
      </h2>
      {matches.map((m) => {
        const opponent = m.opponentCountry;
        const displayName = opponent
          ? getCountryDisplayName(opponent, locale)
          : null;
        const year = m.opponentWorldCup;
        const result = preview ? null : resultLine(m, locale);

        return (
          <div
            key={m.stage}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {getStageLabel(locale, m.stage)}
            </div>
            {displayName ? (
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    {t(locale, "sim.vs")}
                  </span>
                  <CountryFlag country={opponent!} size={22} />
                  <span className="min-w-0 truncate">
                    <span className="text-base font-black">{displayName}</span>
                    {year != null && (
                      <span className="ml-1.5 text-sm font-bold tabular-nums text-[var(--accent-gold)]">
                        {year}
                      </span>
                    )}
                  </span>
                </div>
                {result && (
                  <span className="shrink-0 font-mono text-sm font-bold">{result}</span>
                )}
              </div>
            ) : (
              result && (
                <div className="mt-1 text-right font-mono text-sm font-bold">{result}</div>
              )
            )}
          </div>
        );
      })}
      {preview && (
        <p className="text-xs text-[var(--text-muted)]">{t(locale, "sim.fixturesHint")}</p>
      )}
    </div>
  );
}

/** Build placeholder MatchResult rows for pre-simulation fixture preview. */
export function fixturesToPreviewMatches(
  fixtures: {
    stage: MatchStage;
    opponentCountry: string;
    opponentWorldCup: number;
    opponentFlagCode: string | null;
  }[],
): MatchResult[] {
  return fixtures.map((f) => ({
    stage: f.stage,
    opponentCountry: f.opponentCountry,
    opponentWorldCup: f.opponentWorldCup,
    opponentFlagCode: f.opponentFlagCode,
    opponentDifficulty: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    result: "D" as const,
  }));
}
