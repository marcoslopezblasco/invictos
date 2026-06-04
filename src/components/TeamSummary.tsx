"use client";

import type { DraftedPlayer } from "@/types/simulation";
import type { Language } from "@/types/simulation";
import { buildTeamProfile } from "@/lib/scoring";
import { t } from "@/lib/i18n";
import { FormationPitch } from "./FormationPitch";

export function TeamSummary({
  drafted,
  teamName,
  locale,
}: {
  drafted: DraftedPlayer[];
  teamName: string;
  locale: Language;
}) {
  const profile = buildTeamProfile(drafted);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">{teamName}</h2>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="text-sm text-[var(--text-muted)]">
          {t(locale, "review.formation")}
        </div>
        <div className="text-2xl font-black text-[var(--accent-gold)]">
          {profile.formation}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div>
            {t(locale, "review.attack")}: {Math.round(profile.attackPower)}
          </div>
          <div>
            {t(locale, "review.defense")}: {Math.round(profile.defensiveSecurity)}
          </div>
          <div>
            {t(locale, "review.midfield")}: {Math.round(profile.midfieldControl)}
          </div>
          <div>
            {t(locale, "review.balance")}: {Math.round(profile.balance)}
          </div>
        </div>
      </div>
      <FormationPitch drafted={drafted} />
    </div>
  );
}
