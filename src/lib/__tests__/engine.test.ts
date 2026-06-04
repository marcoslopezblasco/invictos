import { describe, expect, it } from "vitest";
import type { Player, PlayerAppearance } from "@/types/player";
import type { DraftedPlayer } from "@/types/simulation";
import { getFormationString, calculateBalanceScore } from "../formations";
import { buildTeamProfile, calculateMarginalContribution } from "../scoring";
import { simulateTournament, simulateMatchScore, STAGES } from "../simulation";
import {
  getPositionCountsFromPicks,
  generateSpin,
  type DataIndexes,
} from "../draft";
import type { GameState } from "@/types/game";
import { createInitialGameState } from "../draft";

function makePlayer(
  id: string,
  position: Player["position"],
  stats: Partial<Player["profile"]> = {},
): Player {
  const base = {
    attack: 80,
    defense: 80,
    control: 80,
    mentality: 80,
    physical: 80,
    overall: 85,
    ...stats,
  };
  return {
    id,
    name: id,
    normalizedName: id,
    countries: ["Test"],
    position,
    worldCupsPlayed: [2022],
    profile: base,
  };
}

function makeAppearance(
  player: Player,
  country: string,
  year: number,
): PlayerAppearance {
  return {
    id: `${player.id}-${country}-${year}`,
    playerId: player.id,
    country,
    worldCup: year,
    displayName: player.name,
    displayCountry: country,
    displayYear: year,
    position: player.position,
  };
}

function buildFixtureXI(): DraftedPlayer[] {
  const roster: Array<[string, Player["position"], Partial<Player["profile"]>]> = [
    ["gk1", "GK", { defense: 88, overall: 90 }],
    ["def1", "DEF", { defense: 90 }],
    ["def2", "DEF", { defense: 88 }],
    ["def3", "DEF", { defense: 86 }],
    ["mid1", "MID", { control: 92, attack: 85 }],
    ["mid2", "MID", { control: 88 }],
    ["mid3", "MID", { control: 86 }],
    ["fwd1", "FWD", { attack: 94 }],
    ["fwd2", "FWD", { attack: 90 }],
    ["mid4", "MID", { control: 84 }],
    ["def4", "DEF", { defense: 84 }],
  ];
  return roster.map(([id, pos, stats]) => {
    const player = makePlayer(id, pos, stats);
    return {
      player,
      appearance: makeAppearance(player, "Brazil", 2002),
    };
  });
}

describe("formations", () => {
  it("computes 4-4-2 for balanced XI", () => {
    const counts = { GK: 1, DEF: 4, MID: 4, FWD: 2 };
    expect(getFormationString(counts)).toBe("4-4-2");
    expect(calculateBalanceScore(counts)).toBeGreaterThan(5);
  });
});

describe("scoring", () => {
  it("builds team profile from 11 players", () => {
    const team = buildTeamProfile(buildFixtureXI());
    expect(team.formation).toBe("4-4-2");
    expect(team.tournamentPower).toBeGreaterThan(70);
    expect(team.goalkeeperQuality).toBeGreaterThan(80);
  });

  it("marginal contribution is higher for GK when team lacks goalkeeper", () => {
    const outfield = buildFixtureXI().filter((p) => p.appearance.position !== "GK");
    const gk = makePlayer("gk-need", "GK", { overall: 95, defense: 95 });
    const fwd = makePlayer("fwd-extra", "FWD", { attack: 99 });
    const gkContrib = calculateMarginalContribution(gk, outfield);
    const fwdContrib = calculateMarginalContribution(fwd, outfield);
    expect(gkContrib).toBeGreaterThan(fwdContrib);
  });
});

describe("simulation", () => {
  it("is deterministic for same XI", () => {
    const xi = buildFixtureXI();
    const a = simulateTournament("Test FC", xi, "en");
    const b = simulateTournament("Test FC", xi, "en");
    expect(a.score).toBe(b.score);
    expect(a.badge).toBe(b.badge);
    expect(a.matches.length).toBe(b.matches.length);
    expect(a.goalsFor).toBe(b.goalsFor);
  });

  it("runs up to 7 matches", () => {
    const result = simulateTournament("Test", buildFixtureXI());
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches.length).toBeLessThanOrEqual(7);
  });

  it("match score thresholds", () => {
    expect(simulateMatchScore(100, 68)).toBeGreaterThanOrEqual(18);
    expect(simulateMatchScore(70, 95)).toBeLessThan(-15);
  });

  it("has 7 stages defined", () => {
    expect(STAGES).toHaveLength(7);
  });
});

describe("draft position forcing", () => {
  it("forces GK on last pick when missing", () => {
    const players = new Map<string, Player>();
    const appearances: PlayerAppearance[] = [];
    const gk = makePlayer("keeper", "GK");
    const fwd = makePlayer("striker", "FWD", { attack: 99 });
    players.set(gk.id, gk);
    players.set(fwd.id, fwd);
    appearances.push(makeAppearance(gk, "Brazil", 2002));
    appearances.push(makeAppearance(fwd, "Brazil", 2002));

    const indexes: DataIndexes = {
      countries: [
        {
          id: "brazil",
          name: "Brazil",
          nameEs: "Brasil",
          flag: "🇧🇷",
          tier: 1,
          worldCups: [2002],
        },
      ],
      appearancesByCountryCup: new Map([
        ["Brazil::2002", appearances],
      ]),
      playersById: players,
      countryCupCombos: [{ country: "Brazil", worldCup: 2002 }],
    };

    const picks = Array.from({ length: 10 }, (_, i) => ({
      round: i + 1,
      country: "Brazil",
      worldCup: 2002,
      selectedAppearanceId: `striker-Brazil-2002`,
      selectedPlayerId: "striker",
      assignedPosition: "FWD" as const,
    }));

    const state: GameState = {
      id: "test",
      teamName: "XI",
      mode: "classic",
      picks,
      rerollsRemaining: 3,
      lockedPlayerIds: ["striker"],
      language: "en",
      currentSpin: { country: "Brazil", worldCup: 2002 },
    };

    const counts = getPositionCountsFromPicks(picks);
    expect(counts.GK).toBe(0);
    const spin = generateSpin(state, indexes, 0);
    expect(spin.country).toBe("Brazil");
  });
});
