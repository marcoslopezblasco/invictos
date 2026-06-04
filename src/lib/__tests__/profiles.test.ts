import { describe, expect, it } from "vitest";
import {
  applyLegendBoost,
  computeProfileFromCareer,
} from "../../../scripts/data/compute-profiles";

describe("computeProfileFromCareer", () => {
  it("gives 1930 squad players modest varied stats, not flat 88s", () => {
    const profile = computeProfileFromCareer(
      "GK",
      { goals: 0, matchApps: 2, squadTournaments: 1, starterApps: 2 },
      [1930],
      1,
    );
    expect(profile.overall).toBeLessThan(80);
    const values = [
      profile.attack,
      profile.defense,
      profile.control,
      profile.mentality,
      profile.physical,
    ];
    expect(new Set(values).size).toBeGreaterThan(1);
  });
});

describe("applyLegendBoost", () => {
  it("lifts overall without flattening every attribute to the same number", () => {
    const base = computeProfileFromCareer(
      "FWD",
      { goals: 15, matchApps: 20, squadTournaments: 4, starterApps: 18 },
      [1998, 2002, 2006, 2010],
      1,
    );
    const boosted = applyLegendBoost(base, "elite", "FWD");
    expect(boosted.overall).toBeGreaterThanOrEqual(88);
    const attrs = [
      boosted.attack,
      boosted.defense,
      boosted.control,
      boosted.mentality,
      boosted.physical,
    ];
    expect(new Set(attrs).size).toBeGreaterThan(1);
    expect(boosted.attack).toBeGreaterThan(boosted.defense);
  });
});
