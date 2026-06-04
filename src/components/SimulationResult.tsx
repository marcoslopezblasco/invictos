"use client";

import type { TournamentResult } from "@/types/simulation";
import { t } from "@/lib/i18n";
import type { Language } from "@/types/simulation";

const STAGE_LABELS: Record<Language, Record<string, string>> = {
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

export function SimulationResult({
  tournament,
  locale,
}: {
  tournament: TournamentResult;
  locale: Language;
}) {
  const labels = STAGE_LABELS[locale];

  return (
    <div className="flex flex-col gap-2">
      {tournament.matches.map((m) => {
        const label = labels[m.stage] ?? m.stage;
        const score = `${m.goalsFor}-${m.goalsAgainst}`;
        const resultIcon =
          m.result === "W" ? "✓" : m.result === "D" ? "=" : "✗";
        const penNote = m.advancedOnPenalties
          ? " (pen)"
          : m.eliminatedOnPenalties
            ? " (out pen)"
            : "";

        return (
          <div
            key={m.stage}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm"
          >
            <span>{label}</span>
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
