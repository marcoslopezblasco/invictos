import { describe, expect, it } from "vitest";
import { layoutPlayersOnPitch } from "../pitch-layout";
import type { DraftedPlayer } from "@/types/simulation";

function makeDrafted(
  id: string,
  name: string,
  position: "GK" | "DEF" | "MID" | "FWD",
): DraftedPlayer {
  return {
    appearance: {
      id,
      playerId: id,
      country: "Brazil",
      worldCup: 2002,
      displayName: name,
      displayCountry: "Brazil",
      displayYear: 2002,
      position,
    },
    player: {
      id,
      name,
      normalizedName: id,
      countries: ["Brazil"],
      position,
      worldCupsPlayed: [2002],
      profile: {
        attack: 70,
        defense: 70,
        control: 70,
        mentality: 70,
        physical: 70,
        overall: 70,
      },
    },
  };
}

describe("layoutPlayersOnPitch", () => {
  it("places 4-4-2 on four tactical rows", () => {
    const drafted = [
      makeDrafted("gk", "Keeper", "GK"),
      ...Array.from({ length: 4 }, (_, i) =>
        makeDrafted(`d${i}`, `Def ${i}`, "DEF"),
      ),
      ...Array.from({ length: 4 }, (_, i) =>
        makeDrafted(`m${i}`, `Mid ${i}`, "MID"),
      ),
      ...Array.from({ length: 2 }, (_, i) =>
        makeDrafted(`f${i}`, `Fwd ${i}`, "FWD"),
      ),
    ];
    const nodes = layoutPlayersOnPitch(drafted);
    expect(nodes).toHaveLength(11);
    expect(nodes.filter((n) => n.y === 84)).toHaveLength(1);
    expect(nodes.filter((n) => n.y === 58)).toHaveLength(4);
    expect(nodes.filter((n) => n.y === 34)).toHaveLength(4);
    expect(nodes.filter((n) => n.y === 10)).toHaveLength(2);
  });
});
