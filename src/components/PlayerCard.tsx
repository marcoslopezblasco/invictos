"use client";

import type { Player, PlayerAppearance } from "@/types/player";
import type { GameMode, Language } from "@/types/simulation";
import { CountryFlag } from "./CountryFlag";
import { tierBadgeClass, tierLabel } from "@/lib/player-display";
import { t } from "@/lib/i18n";

export function PlayerCard({
  appearance,
  player,
  mode,
  locale,
  onSelect,
}: {
  appearance: PlayerAppearance;
  player: Player;
  mode: GameMode;
  locale: Language;
  onSelect: () => void;
}) {
  const p = player.profile;
  const worldCups = player.worldCupsPlayed.length;
  const matches = p.matches ?? 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="card-sticker w-full rounded-xl p-3 text-left transition active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-900/70">
            <CountryFlag country={appearance.country} size={18} />
            <span>
              {appearance.country} {appearance.worldCup}
            </span>
          </div>
          <div className="text-base font-bold leading-tight">{appearance.displayName}</div>
          <div className="mt-0.5 text-xs font-semibold text-amber-900/80">
            {appearance.position}
          </div>
        </div>
        {mode === "classic" && (
          <div
            className={`shrink-0 rounded-lg px-2 py-1 text-center text-[10px] font-black uppercase tracking-wide ${tierBadgeClass(p.overall)}`}
          >
            {tierLabel(locale, p.overall)}
          </div>
        )}
      </div>
      {mode === "classic" && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-semibold">
          <div className="rounded bg-amber-900/8 px-2 py-1">
            <div className="text-amber-900/50">{t(locale, "card.worldCups")}</div>
            <div className="text-sm font-black text-amber-950">{worldCups}</div>
          </div>
          <div className="rounded bg-amber-900/8 px-2 py-1">
            <div className="text-amber-900/50">{t(locale, "card.matches")}</div>
            <div className="text-sm font-black text-amber-950">{matches}</div>
          </div>
        </div>
      )}
    </button>
  );
}
