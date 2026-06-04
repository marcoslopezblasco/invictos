"use client";

import type { Language, MatchResult, MatchStage } from "@/types/simulation";
import { getCountryDisplayName } from "@/lib/data";
import { t } from "@/lib/i18n";
import { getStageLabel } from "@/lib/stages";
import { CountryFlag } from "./CountryFlag";

export { getStageLabel } from "@/lib/stages";

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
  compact = false,
  showHeading = true,
  abstract = false,
}: {
  locale: Language;
  matches: MatchResult[];
  preview?: boolean;
  /** Tighter rows for results page (stage + opponent + score). */
  compact?: boolean;
  showHeading?: boolean;
  /** Classic/Blind: stage + score only. */
  abstract?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {showHeading && (
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--accent-gold)]">
          {t(locale, preview ? "sim.fixturesPreview" : "sim.fixtures")}
        </h2>
      )}
      {matches.map((m) => {
        const opponent = m.opponentCountry;
        const displayName = opponent
          ? getCountryDisplayName(opponent, locale)
          : null;
        const year = m.opponentWorldCup;
        const result = preview ? null : resultLine(m, locale);
        const label = getStageLabel(locale, m.stage);

        if (compact && abstract) {
          return (
            <div
              key={m.stage}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm"
            >
              <span className="font-bold text-[var(--accent-gold)]">{label}</span>
              {result && (
                <span className="shrink-0 font-mono font-bold">{result}</span>
              )}
            </div>
          );
        }

        if (compact && displayName) {
          return (
            <div
              key={m.stage}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent-gold)]">
                  {label}
                </div>
                <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                    {t(locale, "sim.vs")}
                  </span>
                  <CountryFlag country={opponent!} size={18} />
                  <span className="truncate text-xs font-bold">
                    {displayName}
                    {year != null && (
                      <span className="ml-1 font-black tabular-nums text-[var(--accent-gold)]">
                        {year}
                      </span>
                    )}
                  </span>
                </div>
              </div>
              {result && (
                <span className="shrink-0 font-mono text-sm font-bold">{result}</span>
              )}
            </div>
          );
        }

        return (
          <div
            key={m.stage}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {label}
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
