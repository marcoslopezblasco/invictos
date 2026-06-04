import { describe, expect, it } from "vitest";
import type { Player, PlayerAppearance } from "@/types/player";
import type { DraftedPlayer } from "@/types/simulation";
import { getFormationString, calculateBalanceScore } from "../formations";
import {
  buildTeamProfile,
  calculateMarginalContribution,
  computeAttackOverload,
} from "../scoring";
import {
  simulateTournament,
  simulateMatchScore,
  enrichHistoricMatches,
  STAGES,
  CLASSIC_MODE_DIFFICULTY_BONUS,
} from "../simulation";
import {
  getTournamentPools,
  poolCountriesForStage,
} from "../historical-opponents";
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

  it("heavily penalizes 1-3-6 chaos formations", () => {
    const counts = { GK: 1, DEF: 1, MID: 3, FWD: 6 };
    expect(getFormationString(counts)).toBe("1-3-6");
    expect(calculateBalanceScore(counts)).toBeLessThan(-25);
  });
});

function buildChaosXI(): DraftedPlayer[] {
  const roster: Array<[string, Player["position"], Partial<Player["profile"]>]> = [
    ["gk1", "GK", { defense: 88, overall: 85 }],
    ["def1", "DEF", { defense: 90, overall: 88 }],
    ["mid1", "MID", { control: 90, attack: 85 }],
    ["mid2", "MID", { control: 88 }],
    ["mid3", "MID", { control: 86 }],
    ["fwd1", "FWD", { attack: 94 }],
    ["fwd2", "FWD", { attack: 92 }],
    ["fwd3", "FWD", { attack: 91 }],
    ["fwd4", "FWD", { attack: 90 }],
    ["fwd5", "FWD", { attack: 89 }],
    ["fwd6", "FWD", { attack: 88 }],
  ];
  return roster.map(([id, pos, stats]) => {
    const player = makePlayer(id, pos, stats);
    return {
      player,
      appearance: makeAppearance(player, "Brazil", 2002),
    };
  });
}

describe("scoring", () => {
  it("builds team profile from 11 players", () => {
    const team = buildTeamProfile(buildFixtureXI());
    expect(team.formation).toBe("4-4-2");
    expect(team.tournamentPower).toBeGreaterThan(70);
    expect(team.goalkeeperQuality).toBeGreaterThan(80);
    expect(team.attackOverload).toBeLessThan(0.35);
  });

  it("attack overload is high for front-heavy XIs", () => {
    const chaos = buildChaosXI();
    const counts = { GK: 1, DEF: 1, MID: 3, FWD: 6 };
    const team = buildTeamProfile(chaos);
    expect(team.attackOverload).toBeGreaterThan(0.45);
    expect(computeAttackOverload(counts, team.attackPower, team.defensiveSecurity)).toBeGreaterThan(0.45);
  });

  it("crushes tournament power for structurally broken XIs", () => {
    const chaos = buildTeamProfile(buildChaosXI());
    expect(chaos.formation).toBe("1-3-6");
    expect(chaos.balance).toBeLessThan(-25);
    expect(chaos.tournamentPower).toBeLessThan(55);
    expect(chaos.defensiveSecurity).toBeLessThan(55);
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

  it("classic mode faces harder opponents than blind with same XI", () => {
    const xi = buildFixtureXI();
    let classicWins = 0;
    let blindWins = 0;
    for (let i = 0; i < 30; i++) {
      classicWins += simulateTournament(`Cmp C ${i}`, xi, "en", "classic").wins;
      blindWins += simulateTournament(`Cmp B ${i}`, xi, "en", "blind").wins;
    }
    expect(classicWins).toBeLessThan(blindWins);
    expect(CLASSIC_MODE_DIFFICULTY_BONUS).toBe(8);
  });

  it("chaos XI rarely survives the group stage", () => {
    const chaos = buildChaosXI();
    let earlyExit = 0;
    let deepRun = 0;
    for (let i = 0; i < 40; i++) {
      const r = simulateTournament(`Chaos FC ${i}`, chaos, "en");
      if (r.finalStage === "GROUP_1" || r.finalStage === "GROUP_2") {
        earlyExit++;
      }
      if (r.matches.length >= 6) deepRun++;
    }
    expect(earlyExit).toBeGreaterThan(20);
    expect(deepRun).toBeLessThan(8);
  });

  it("champion score adds full goal difference on top of base", () => {
    const xi = buildFixtureXI();
    let found = false;
    for (let i = 0; i < 120; i++) {
      const r = simulateTournament(`Champ GD ${i}`, xi, "en");
      if (r.champion && r.goalDifference > 0) {
        expect(r.score).toBeGreaterThan(100);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("enrichHistoricMatches backfills opponents on saved rows", () => {
    const xi = buildFixtureXI();
    const raw = simulateTournament("Enrich FC", xi, "en", "historico");
    const stripped = raw.matches.map((m) => ({
      ...m,
      opponentCountry: undefined,
      opponentWorldCup: undefined,
      opponentFlagCode: undefined,
    }));
    const enriched = enrichHistoricMatches(stripped, "Enrich FC", xi);
    expect(enriched.every((m) => m.opponentCountry)).toBe(true);
    expect(enriched[0]?.opponentCountry).toBe(raw.matches[0]?.opponentCountry);
  });

  it("historico mode assigns real opponents from stage pools", () => {
    const xi = buildFixtureXI();
    const pools = getTournamentPools();
    const result = simulateTournament("Hist FC", xi, "en", "historico");
    expect(result.matches.length).toBeGreaterThan(0);
    for (const m of result.matches) {
      expect(m.opponentCountry).toBeTruthy();
      expect(m.opponentWorldCup).toBeGreaterThan(1900);
      const key =
        m.stage === "GROUP_1" || m.stage === "GROUP_2" || m.stage === "GROUP_3"
          ? "group"
          : m.stage;
      const stagePool = pools[key as keyof typeof pools];
      expect(stagePool[m.opponentCountry!]).toContain(m.opponentWorldCup);
    }
    expect(poolCountriesForStage("FINAL").length).toBeGreaterThan(0);
    const opponents = result.matches.map((m) => m.opponentCountry);
    expect(new Set(opponents).size).toBe(opponents.length);
  });

  it("abstract mode has no named opponents", () => {
    const result = simulateTournament("Abs FC", buildFixtureXI(), "en", "classic");
    for (const m of result.matches) {
      expect(m.opponentCountry).toBeUndefined();
    }
  });

  it("balanced XI produces modest scorelines on average", () => {
    const xi = buildFixtureXI();
    let totalGoals = 0;
    let matches = 0;
    for (let i = 0; i < 40; i++) {
      const r = simulateTournament(`Modest ${i}`, xi, "en");
      for (const m of r.matches) {
        totalGoals += m.goalsFor + m.goalsAgainst;
        matches++;
        expect(m.goalsFor).toBeLessThanOrEqual(5);
        expect(m.goalsAgainst).toBeLessThanOrEqual(4);
      }
    }
    expect(totalGoals / matches).toBeLessThan(5.5);
  });

  it("scorelines always match result (no 5-2 penalty loss)", () => {
    const xi = buildFixtureXI();
    for (let i = 0; i < 80; i++) {
      const result = simulateTournament(`Scoreline FC ${i}`, xi, "en");
      for (const m of result.matches) {
        if (m.eliminatedOnPenalties || m.advancedOnPenalties) {
          expect(m.goalsFor).toBe(m.goalsAgainst);
          expect(m.result).toBe("D");
        }
        if (m.result === "W") {
          expect(m.goalsFor).toBeGreaterThan(m.goalsAgainst);
        }
        if (m.result === "L") {
          expect(m.goalsFor).toBeLessThan(m.goalsAgainst);
        }
      }
    }
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
          flagCode: "br",
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
