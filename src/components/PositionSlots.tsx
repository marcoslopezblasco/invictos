"use client";

import type { PositionCounts } from "@/types/simulation";
import { t } from "@/lib/i18n";
import type { Language } from "@/types/simulation";

export function PositionSlots({
  counts,
  locale,
}: {
  counts: PositionCounts;
  locale: Language;
}) {
  const slots: Array<{ key: keyof PositionCounts; labelKey: string }> = [
    { key: "GK", labelKey: "slots.gk" },
    { key: "DEF", labelKey: "slots.def" },
    { key: "MID", labelKey: "slots.mid" },
    { key: "FWD", labelKey: "slots.fwd" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map(({ key, labelKey }) => (
        <div
          key={key}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2 py-2 text-center"
        >
          <div className="text-[10px] font-bold text-[var(--text-muted)]">
            {t(locale, labelKey)}
          </div>
          <div className="text-lg font-black tabular-nums text-[var(--accent-gold)]">
            {counts[key]}
          </div>
        </div>
      ))}
    </div>
  );
}
