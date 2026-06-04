import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildShareCaption, DEFAULT_PUBLIC_SITE_URL } from "../share";
import type { SavedResult } from "../storage";

const baseResult: SavedResult = {
  id: "test-1",
  teamName: "Los Invictos",
  mode: "classic",
  language: "en",
  formation: "4-3-3",
  badge: "CHAMPION",
  score: 72,
  timestamp: Date.now(),
  picks: [],
  appearances: [],
  tournament: {
    played: 7,
    wins: 6,
    draws: 1,
    losses: 0,
    goalsFor: 15,
    goalsAgainst: 4,
    goalDifference: 11,
    badge: "CHAMPION",
    narrative:
      "Your XI swept the tournament: seven wins, zero losses, and a 4-3-3 that clicked perfectly.",
    matches: [],
  },
};

describe("buildShareCaption", () => {
  beforeEach(() => {
    vi.stubGlobal("window", undefined);
  });

  it("uses short narrative, challenge, play CTA, and site URL", () => {
    const text = buildShareCaption(baseResult);
    expect(text).toContain("swept the tournament");
    expect(text).toContain("Can you beat my team?");
    expect(text).toContain("Play on Invictos");
    expect(text).toContain(DEFAULT_PUBLIC_SITE_URL);
    expect(text).not.toContain("PJ 7");
  });

  it("uses Spanish challenge copy", () => {
    const text = buildShareCaption({ ...baseResult, language: "es" });
    expect(text).toContain("¿Puedes ganarle a mi equipo?");
    expect(text).toContain("Juega en Invictos");
  });

  it("falls back to score summary when narrative is empty", () => {
    const text = buildShareCaption({
      ...baseResult,
      tournament: { ...baseResult.tournament, narrative: "" },
    });
    expect(text).toContain("72 pts");
    expect(text).toContain("Champion");
  });
});
