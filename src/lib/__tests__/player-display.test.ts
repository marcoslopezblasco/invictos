import { describe, expect, it } from "vitest";
import { ovrToTierKey, tierLabel } from "../player-display";

describe("player display tiers", () => {
  it("maps OVR to tier keys without exposing the number", () => {
    expect(ovrToTierKey(96)).toBe("tier.legend");
    expect(ovrToTierKey(95)).toBe("tier.legend");
    expect(ovrToTierKey(94)).toBe("tier.icon");
    expect(ovrToTierKey(90)).toBe("tier.icon");
    expect(ovrToTierKey(89)).toBe("tier.crack");
    expect(ovrToTierKey(85)).toBe("tier.crack");
    expect(ovrToTierKey(84)).toBe("tier.star");
    expect(ovrToTierKey(80)).toBe("tier.star");
    expect(ovrToTierKey(79)).toBe("tier.solid");
    expect(ovrToTierKey(75)).toBe("tier.solid");
    expect(ovrToTierKey(74)).toBe("tier.regular");
    expect(ovrToTierKey(70)).toBe("tier.regular");
    expect(ovrToTierKey(69)).toBe("tier.squad");
    expect(ovrToTierKey(65)).toBe("tier.squad");
    expect(ovrToTierKey(64)).toBe("tier.fringe");
  });

  it("returns localized labels", () => {
    expect(tierLabel("es", 96)).toBe("Leyenda");
    expect(tierLabel("en", 64)).toBe("Fringe");
  });
});
