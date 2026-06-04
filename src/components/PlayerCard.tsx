"use client";

import type { Player, PlayerAppearance } from "@/types/player";
import type { GameMode, Language } from "@/types/simulation";
import { CountryFlag } from "./CountryFlag";
import { showsClassicCardStats, tierBadgeClass, tierLabel } from "@/lib/player-display";
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
  const showStats = showsClassicCardStats(mode);

  if (!showStats) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="card-sticker w-full rounded-lg px-2.5 py-2 text-left transition active:scale-[0.98]"
      >
        <div className="flex items-center justify-between gap-2 leading-none">
          <span className="min-w-0 truncate text-sm font-black">
            {appearance.displayName}
          </span>
          <span className="shrink-0 text-xs font-bold text-amber-800/85">
            {appearance.position}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="card-sticker w-full rounded-lg px-2.5 py-2 text-left transition active:scale-[0.98]"
    >
      <div className="flex items-center gap-2 leading-tight">
        <CountryFlag country={appearance.country} size={22} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="min-w-0 flex-1 truncate text-sm font-black text-amber-950">
              {appearance.displayName}
            </span>
            <span className="shrink-0 text-xs font-bold text-amber-800/85">
              {appearance.position}
            </span>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black uppercase leading-none ${tierBadgeClass(p.overall)}`}
            >
              {tierLabel(locale, p.overall)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-amber-900/70">
            {appearance.country} {appearance.worldCup}
            {" · "}
            {worldCups} {t(locale, "card.wcShort")}
            {" · "}
            {matches} {t(locale, "card.matchesShort")}
          </p>
        </div>
      </div>
    </button>
  );
}
