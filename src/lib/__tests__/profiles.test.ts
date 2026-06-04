import { describe, expect, it } from "vitest";
import {
  applyLegendBoost,
  applyVeteranBoost,
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

describe("applyVeteranBoost", () => {
  it("lifts WC regulars with many appearances", () => {
    const base = computeProfileFromCareer(
      "MID",
      { goals: 0, matchApps: 9, squadTournaments: 3, starterApps: 7 },
      [1998, 2006, 2010],
      3,
    );
    const boosted = applyVeteranBoost(base, {
      goals: 0,
      matchApps: 9,
      squadTournaments: 3,
      starterApps: 7,
    }, "MID");
    expect(boosted.overall).toBeGreaterThanOrEqual(74);
  });
});

describe("applyLegendBoost", () => {
  it("lifts overall without flattening every attribute to the same number", () => {
    const base = {
      attack: 72,
      defense: 58,
      control: 76,
      mentality: 70,
      physical: 68,
      overall: 70,
    };
    const boosted = applyLegendBoost(base, "elite", "FWD");
    expect(boosted.overall).toBeGreaterThanOrEqual(88);
    expect(boosted.attack).toBeGreaterThan(boosted.defense);
    expect(boosted.control).not.toBe(boosted.attack);
  });
});
