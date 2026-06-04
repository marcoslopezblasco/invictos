"use client";

import { useMemo } from "react";
import type { GameState } from "@/types/game";
import { TOTAL_PICKS } from "@/types/game";
import { getPositionCountsFromPicks } from "@/lib/draft";
import { getFormationString } from "@/lib/formations";
import { getFlagForCountry } from "@/lib/data";
import { loadData, getAppearancesById } from "@/lib/data";
import { t } from "@/lib/i18n";
import type { Language } from "@/types/simulation";
import { PositionSlots } from "./PositionSlots";

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

  const slots = Array.from({ length: TOTAL_PICKS }, (_, i) => {
    const pick = gameState.picks[i];
    if (!pick) return null;
    const app = appearancesById.get(pick.selectedAppearanceId);
    const player = indexes.playersById.get(pick.selectedPlayerId);
    return {
      pick,
      name: app?.displayName ?? player?.name ?? "?",
      flag: getFlagForCountry(pick.country),
      position:
        pick.assignedPosition ??
        indexes.playersById.get(pick.selectedPlayerId)?.position ??
        "MID",
      year: pick.worldCup,
    };
  });

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

      <ul className="mt-3 max-h-36 space-y-1 overflow-y-auto">
        {slots.map((slot, i) =>
          slot ? (
            <li
              key={slot.pick.selectedAppearanceId}
              className="flex items-center gap-2 rounded-lg bg-black/20 px-2 py-1.5 text-xs"
            >
              <span className="w-4 shrink-0 text-[var(--text-muted)]">
                {i + 1}
              </span>
              <span>{slot.flag}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">
                {slot.name}
              </span>
              <span className="shrink-0 rounded bg-[var(--accent)]/20 px-1.5 py-0.5 font-bold text-[var(--accent)]">
                {slot.position}
              </span>
            </li>
          ) : (
            <li
              key={`empty-${i}`}
              className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text-muted)]"
            >
              <span className="w-4">{i + 1}</span>
              <span className="italic">{t(locale, "draft.emptySlot")}</span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
