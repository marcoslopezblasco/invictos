"use client";

import type { Player, PlayerAppearance } from "@/types/player";
import type { Position } from "@/types/player";
import { t } from "@/lib/i18n";
import type { Language } from "@/types/simulation";
import { getFlagForCountry } from "@/lib/data";

const POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"];

export function PositionPicker({
  appearance,
  player,
  validPositions,
  defaultPosition,
  locale,
  onConfirm,
  onCancel,
}: {
  appearance: PlayerAppearance;
  player: Player;
  validPositions: Position[];
  defaultPosition: Position;
  locale: Language;
  onConfirm: (position: Position) => void;
  onCancel: () => void;
}) {
  const flag = getFlagForCountry(appearance.country);
  const natural = player.position;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xl">
        <p className="text-center text-xs font-bold uppercase tracking-wide text-[var(--accent-gold)]">
          {t(locale, "draft.assignPosition")}
        </p>
        <div className="mt-3 text-center">
          <div className="text-2xl">{flag}</div>
          <div className="text-lg font-black">{appearance.displayName}</div>
          <div className="text-sm text-[var(--text-muted)]">
            {appearance.country} {appearance.worldCup} · {t(locale, "draft.naturalRole")}{" "}
            {natural}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {POSITIONS.map((pos) => {
            const allowed = validPositions.includes(pos);
            const isDefault = pos === defaultPosition;
            return (
              <button
                key={pos}
                type="button"
                disabled={!allowed}
                onClick={() => allowed && onConfirm(pos)}
                className={`rounded-xl py-4 text-center font-black transition ${
                  allowed
                    ? "bg-[var(--accent)] text-white hover:brightness-110 active:scale-[0.98]"
                    : "cursor-not-allowed bg-black/30 text-[var(--text-muted)] opacity-50"
                } ${isDefault && allowed ? "ring-2 ring-[var(--accent-gold)]" : ""}`}
              >
                {pos}
              </button>
            );
          })}
        </div>

        {validPositions.length === 1 && (
          <p className="mt-3 text-center text-xs text-amber-400/90">
            {t(locale, "draft.onlyPositionAllowed")}
          </p>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full py-2 text-sm text-[var(--text-muted)] underline"
        >
          {t(locale, "draft.cancelPick")}
        </button>
      </div>
    </div>
  );
}
