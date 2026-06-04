"use client";

import type { Player, PlayerAppearance } from "@/types/player";
import type { GameMode, Language } from "@/types/simulation";
import { CountryFlag } from "./CountryFlag";
import { getCountryDisplayName } from "@/lib/data";
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
              {getCountryDisplayName(appearance.country, locale)} {appearance.worldCup}
            </span>
          </div>
          <div className="text-base font-bold leading-tight">{appearance.displayName}</div>
          {showStats ? (
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-xs leading-snug text-amber-900/75">
              <span className="font-semibold text-amber-900/90">
                {t(locale, "card.pos")}: {appearance.position}
              </span>
              <span className="text-amber-900/40" aria-hidden>
                ·
              </span>
              <span>
                {t(locale, "card.worldCups")}:{" "}
                <span className="font-black text-amber-950">{worldCups}</span>
              </span>
              <span className="text-amber-900/40" aria-hidden>
                ·
              </span>
              <span>
                {t(locale, "card.matches")}:{" "}
                <span className="font-black text-amber-950">{matches}</span>
              </span>
            </p>
          ) : (
            <div className="mt-0.5 text-xs font-semibold text-amber-900/80">
              {t(locale, "card.pos")}: {appearance.position}
            </div>
          )}
        </div>
        {showStats && (
          <div
            className={`shrink-0 rounded-lg px-2 py-1 text-center text-[10px] font-black uppercase tracking-wide ${tierBadgeClass(p.overall)}`}
          >
            {tierLabel(locale, p.overall)}
          </div>
        )}
      </div>
    </button>
  );
}
