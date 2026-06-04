"use client";

import { useMemo } from "react";
import type { GameState } from "@/types/game";
import { getPositionCountsFromPicks, picksToDrafted } from "@/lib/draft";
import { getFormationString } from "@/lib/formations";
import { loadData, getAppearancesById } from "@/lib/data";
import { t } from "@/lib/i18n";
import type { Language } from "@/types/simulation";
import { PositionSlots } from "./PositionSlots";
import { FormationPitch } from "./FormationPitch";

export function TeamBuilderPanel({
  gameState,
  locale,
}: {
  gameState: GameState;
  locale: Language;
}) {
  const indexes = useMemo(() => loadData(), []);
  const appearancesById = useMemo(() => getAppearancesById(), []);

  const counts = getPositionCountsFromPicks(
    gameState.picks,
    indexes.playersById,
    appearancesById,
  );
  const formation =
    gameState.picks.length >= 4
      ? getFormationString(counts)
      : "—";

  const drafted = useMemo(
    () =>
      picksToDrafted(
        gameState.picks,
        appearancesById,
        indexes.playersById,
      ),
    [gameState.picks, appearancesById, indexes.playersById],
  );

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
          {t(locale, "draft.yourXi")}
        </span>
        <span className="text-xs font-bold text-[var(--accent-gold)]">
          {t(locale, "draft.formation")}: {formation}
        </span>
      </div>

      <PositionSlots counts={counts} locale={locale} />

      {drafted.length > 0 && (
        <div className="mt-3">
          <FormationPitch drafted={drafted} compact />
        </div>
      )}
    </div>
  );
}
