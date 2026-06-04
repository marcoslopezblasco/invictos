import type { DraftedPlayer } from "@/types/simulation";
import type { Position } from "@/types/player";

const ROW_Y: Record<Position, number> = {
  FWD: 10,
  MID: 34,
  DEF: 58,
  GK: 84,
};

const ROW_ORDER: Position[] = ["FWD", "MID", "DEF", "GK"];

export interface PitchNode {
  id: string;
  name: string;
  shortName: string;
  country: string;
  position: Position;
  x: number;
  y: number;
}

/** Lowercase surname particles kept with the following word (Di María, Van Basten, …). */
const SURNAME_PARTICLES = new Set([
  "da",
  "das",
  "de",
  "del",
  "della",
  "der",
  "di",
  "do",
  "dos",
  "du",
  "el",
  "la",
  "las",
  "le",
  "los",
  "van",
  "von",
  "y",
]);

function truncateLabel(label: string, max = 13): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export function shortPlayerName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return truncateLabel(name);

  let start = parts.length - 1;
  while (start > 0 && SURNAME_PARTICLES.has(parts[start - 1]!.toLowerCase())) {
    start -= 1;
  }

  const label = parts.slice(start).join(" ");
  return truncateLabel(label);
}

function rowXPositions(count: number): number[] {
  if (count === 0) return [];
  if (count === 1) return [50];
  const margin = 14;
  const span = 100 - margin * 2;
  return Array.from({ length: count }, (_, i) => margin + (span * i) / (count - 1));
}

export function groupByPosition(
  drafted: DraftedPlayer[],
): Record<Position, DraftedPlayer[]> {
  const groups: Record<Position, DraftedPlayer[]> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };
  for (const d of drafted) {
    groups[d.appearance.position].push(d);
  }
  return groups;
}

/** Place each picked player on a tactical row by position (FWD → GK). */
export function layoutPlayersOnPitch(drafted: DraftedPlayer[]): PitchNode[] {
  const groups = groupByPosition(drafted);
  const nodes: PitchNode[] = [];

  for (const row of ROW_ORDER) {
    const players = groups[row];
    const xs = rowXPositions(players.length);
    players.forEach((d, i) => {
      nodes.push({
        id: d.appearance.id,
        name: d.appearance.displayName,
        shortName: shortPlayerName(d.appearance.displayName),
        country: d.appearance.country,
        position: row,
        x: xs[i] ?? 50,
        y: ROW_Y[row],
      });
    });
  }

  return nodes;
}
