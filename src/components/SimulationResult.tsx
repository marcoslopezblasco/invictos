"use client";

import type { TournamentResult } from "@/types/simulation";
import type { Language } from "@/types/simulation";
import { MatchSchedule, getStageLabel } from "./MatchSchedule";

function AbstractMatchList({
  tournament,
  locale,
}: {
  tournament: TournamentResult;
  locale: Language;
}) {
  return (
    <div className="flex flex-col gap-2">
      {tournament.matches.map((m) => {
        const label = getStageLabel(locale, m.stage);
        const score = `${m.goalsFor}-${m.goalsAgainst}`;
        const resultIcon = m.advancedOnPenalties
          ? "✓"
          : m.eliminatedOnPenalties
            ? "✗"
            : m.result === "W"
              ? "✓"
              : m.result === "D"
                ? "="
                : "✗";
        const penNote =
          m.advancedOnPenalties || m.eliminatedOnPenalties ? " (pen)" : "";

        return (
          <div
            key={m.stage}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm"
          >
            <span className="font-bold text-[var(--accent-gold)]">{label}</span>
            <span className="font-mono font-bold">
              {resultIcon} {score}
              {penNote}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SimulationResult({
  tournament,
  locale,
}: {
  tournament: TournamentResult;
  locale: Language;
}) {
  const hasOpponents = tournament.matches.some((m) => m.opponentCountry);
  if (hasOpponents) {
    return <MatchSchedule locale={locale} matches={tournament.matches} />;
  }
  return <AbstractMatchList tournament={tournament} locale={locale} />;
}
