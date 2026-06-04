import { describe, expect, it } from "vitest";
import { canonicalTeamName } from "../../../scripts/data/constants";

describe("historical country slots", () => {
  it("maps CSV team names to politically distinct draft countries", () => {
    expect(canonicalTeamName("Yugoslavia")).toBe("Yugoslavia");
    expect(canonicalTeamName("FR Yugoslavia")).toBe("Yugoslavia");
    expect(canonicalTeamName("Serbia and Montenegro")).toBe("Serbia and Montenegro");
    expect(canonicalTeamName("Serbia")).toBe("Serbia");
    expect(canonicalTeamName("Czechoslovakia")).toBe("Czechoslovakia");
    expect(canonicalTeamName("Czech Republic")).toBe("Czech Republic");
  });

  it("does not merge Yugoslavia or Czechoslovakia into modern states", () => {
    expect(canonicalTeamName("Yugoslavia")).not.toBe("Serbia");
    expect(canonicalTeamName("Czechoslovakia")).not.toBe("Czech Republic");
  });
});
