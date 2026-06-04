"use client";

import type { Player, PlayerAppearance } from "@/types/player";
import type { GameMode } from "@/types/simulation";
import { CountryFlag } from "./CountryFlag";

export function PlayerCard({
  appearance,
  player,
  mode,
  onSelect,
}: {
  appearance: PlayerAppearance;
  player: Player;
  mode: GameMode;
  onSelect: () => void;
}) {
  const p = player.profile;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="card-sticker w-full rounded-xl p-3 text-left transition active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
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
          <div className="rounded-lg bg-amber-900/10 px-2 py-1 text-center">
            <div className="text-[10px] uppercase text-amber-900/60">OVR</div>
            <div className="text-lg font-black">{p.overall}</div>
          </div>
        )}
      </div>
      {mode === "classic" && (
        <div className="mt-2 grid grid-cols-5 gap-1 text-[10px] font-semibold">
          {[
            ["ATK", p.attack],
            ["DEF", p.defense],
            ["CTL", p.control],
            ["MEN", p.mentality],
            ["FIS", p.physical],
          ].map(([label, val]) => (
            <div key={label as string} className="rounded bg-amber-900/8 px-1 py-0.5 text-center">
              <div className="text-amber-900/50">{label}</div>
              <div>{val}</div>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
