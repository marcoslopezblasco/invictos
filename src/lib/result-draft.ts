import { loadData } from "@/lib/data";
import { picksToDrafted } from "@/lib/draft";
import type { SavedResult } from "@/lib/storage";
import type { DraftedPlayer } from "@/types/simulation";

export function draftedFromSavedResult(result: SavedResult): DraftedPlayer[] {
  const { playersById } = loadData();
  const appearancesById = new Map(
    result.appearances.map((a) => [a.id, a]),
  );
  return picksToDrafted(result.picks, appearancesById, playersById);
}
