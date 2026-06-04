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
    <div className="flex gap-1.5">
      {slots.map(({ key, labelKey }) => (
        <div
          key={key}
          className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-1.5 py-1"
        >
          <span className="text-[20px] font-bold text-[var(--text-muted)]">
            {t(locale, labelKey)}
          </span>
          <span className="text-sm font-black tabular-nums leading-none text-[var(--accent-gold)]">
            {counts[key]}
          </span>
        </div>
      ))}
    </div>
  );
}
