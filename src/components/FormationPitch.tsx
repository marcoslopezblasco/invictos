"use client";

import type { DraftedPlayer } from "@/types/simulation";
import { layoutPlayersOnPitch } from "@/lib/pitch-layout";
import { CountryFlag } from "./CountryFlag";

export function FormationPitch({
  drafted,
  compact = false,
  share = false,
}: {
  drafted: DraftedPlayer[];
  compact?: boolean;
  /** Taller layout for social share screenshots. */
  share?: boolean;
}) {
  const nodes = layoutPlayersOnPitch(drafted);

  const sizeClass = share
    ? "aspect-[4/5] max-h-80"
    : compact
      ? "aspect-[4/5] max-h-52"
      : "aspect-[3/4] max-h-[420px]";

  const flagSize = share ? 16 : compact ? 14 : 18;
  const nameClass = share
    ? "text-[20px]"
    : compact
      ? "text-[18px]"
      : "text-[20px]";
  const posClass = share
    ? "text-[18px]"
    : compact
      ? "text-[16px]"
      : "text-[18px]";
  const nodeWidth = share
    ? "min-w-[56px] max-w-[68px]"
    : compact
      ? "min-w-[52px] max-w-[64px]"
      : "min-w-[64px] max-w-[80px]";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border-2 border-emerald-900/50 shadow-inner ${sizeClass}`}
      style={{
        background:
          "linear-gradient(180deg, #1a6b38 0%, #228b45 38%, #2d9f52 62%, #1a6b38 100%)",
      }}
    >
      {/* Pitch markings */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" />
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-white" />
        <div className="absolute bottom-0 left-[10%] right-[10%] h-[18%] rounded-t-lg border-2 border-b-0 border-white" />
        <div className="absolute top-0 left-[10%] right-[10%] h-[18%] rounded-b-lg border-2 border-t-0 border-white" />
      </div>

      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div
            className={`flex flex-col items-center rounded-lg border border-amber-900/25 bg-amber-50/95 px-1 py-1 shadow-md ${nodeWidth}`}
          >
            <CountryFlag country={node.country} size={flagSize} />
            <span
              className={`mt-0.5 w-full truncate text-center font-bold leading-tight text-amber-950 ${nameClass}`}
              title={node.name}
            >
              {node.shortName}
            </span>
            <span
              className={`font-bold text-emerald-800/80 ${posClass}`}
            >
              {node.position}
            </span>
          </div>
        </div>
      ))}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
          —
        </div>
      )}
    </div>
  );
}
