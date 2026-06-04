import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildShareMessage, DEFAULT_PUBLIC_SITE_URL } from "../share";
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
    narrative: "",
    matches: [],
  },
};

describe("buildShareMessage", () => {
  beforeEach(() => {
    vi.stubGlobal("window", undefined);
  });

  it("includes challenge, subtitle, and site URL", () => {
    const text = buildShareMessage(baseResult);
    expect(text).toContain("Can you beat my team?");
    expect(text).toContain(DEFAULT_PUBLIC_SITE_URL);
    expect(text).toContain("Los Invictos");
    expect(text).toContain("4-3-3");
  });

  it("uses Spanish challenge copy", () => {
    const text = buildShareMessage({ ...baseResult, language: "es" });
    expect(text).toContain("¿Puedes ganarle a mi equipo?");
  });
});
