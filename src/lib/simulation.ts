import type {
  GameMode,
  Language,
  Badge,
  DraftedPlayer,
  MatchResult,
  MatchStage,
  TournamentResult,
} from "@/types/simulation";
import { hashToUnit, stableHash } from "./hash";
import { buildTeamProfile } from "./scoring";
import { generateNarrative } from "./narrative";
import { pickHistoricalOpponent } from "./historical-opponents";

const STAGES: { stage: MatchStage; difficulty: number }[] = [
  { stage: "GROUP_1", difficulty: 68 },
  { stage: "GROUP_2", difficulty: 74 },
  { stage: "GROUP_3", difficulty: 81 },
  { stage: "R16", difficulty: 84 },
  { stage: "QF", difficulty: 88 },
  { stage: "SF", difficulty: 92 },
  { stage: "FINAL", difficulty: 95 },
];

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function deterministicRound(n: number, seed: string): number {
  const frac = hashToUnit(seed);
  return n + frac >= 0.5 ? Math.ceil(n) : Math.floor(n);
}

/** ±8 swing on effective strength per match (deterministic from seed). */
function matchPowerJitter(seed: string): number {
  return (hashToUnit(`${seed}-pwr`) - 0.5) * 16;
}

function goalNoise(seed: string, key: "gf" | "gc"): number {
  const u = hashToUnit(`${seed}-${key}n`);
  if (u < 0.33) return -1;
  if (u > 0.66) return 1;
  return 0;
}

function matchOutcome(
  matchScore: number,
): "clear_win" | "win" | "narrow_win" | "draw" | "narrow_loss" | "loss" | "clear_loss" {
  if (matchScore >= 18) return "clear_win";
  if (matchScore >= 10) return "win";
  if (matchScore >= 4) return "narrow_win";
  if (matchScore >= -3) return "draw";
  if (matchScore >= -8) return "narrow_loss";
  if (matchScore >= -15) return "loss";
  return "clear_loss";
}

function computeGoals(
  team: ReturnType<typeof buildTeamProfile>,
  difficulty: number,
  seed: string,
): { gf: number; gc: number } {
  const expectedGF = clamp(
    1 +
      (team.attackPower - difficulty) / 18 +
      (team.midfieldControl - 75) / 35,
    0,
    5,
  );
  const expectedGC = clamp(
    1 +
      (difficulty - team.defensiveSecurity) / 18 -
      (team.goalkeeperQuality - 75) / 40,
    0,
    4,
  );
  const gf = clamp(
    deterministicRound(expectedGF, `${seed}-gf`) + goalNoise(seed, "gf"),
    0,
    6,
  );
  const gc = clamp(
    deterministicRound(expectedGC, `${seed}-gc`) + goalNoise(seed, "gc"),
    0,
    5,
  );
  return { gf, gc };
}

function isKnockoutStage(stage: MatchStage): boolean {
  return stage !== "GROUP_1" && stage !== "GROUP_2" && stage !== "GROUP_3";
}

/** Scoreline must match W/D/L so the UI never shows 5-2 with a penalty loss. */
function alignGoalsToResult(
  gf: number,
  gc: number,
  result: MatchResult["result"],
  seed: string,
): { goalsFor: number; goalsAgainst: number } {
  if (result === "W") {
    if (gf <= gc) return { goalsFor: gc + 1, goalsAgainst: gc };
    return { goalsFor: gf, goalsAgainst: gc };
  }
  if (result === "L") {
    if (gf >= gc) return { goalsFor: gf, goalsAgainst: gf + 1 };
    return { goalsFor: gf, goalsAgainst: gc };
  }
  const drawTotal = clamp(
    deterministicRound(
      Math.min(gf, gc, Math.max(0, (gf + gc) / 2)),
      `${seed}-draw`,
    ),
    0,
    4,
  );
  return { goalsFor: drawTotal, goalsAgainst: drawTotal };
}

function resolvePenalties(
  team: ReturnType<typeof buildTeamProfile>,
  difficulty: number,
  drafted: DraftedPlayer[],
  seed: string,
): boolean {
  const topAttack = [...drafted]
    .map((p) => p.player.profile.attack)
    .sort((a, b) => b - a)
    .slice(0, 3);
  const avgTop3 =
    topAttack.length > 0
      ? topAttack.reduce((a, b) => a + b, 0) / topAttack.length
      : 50;

  const penaltyPower =
    team.mentality * 0.35 +
    team.goalkeeperQuality * 0.25 +
    avgTop3 * 0.25 +
    team.midfieldControl * 0.15;

  const threshold = 2 + hashToUnit(`${seed}-pen`) * 4;
  return penaltyPower >= difficulty + threshold;
}

/** Opponents for all 7 matches (deterministic; same as simulateTournament historico). */
export function buildHistoricalFixtures(
  teamName: string,
  drafted: DraftedPlayer[],
): { stage: MatchStage; opponentCountry: string; opponentFlagCode: string | null }[] {
  const seed = getTeamSeed(teamName, drafted);
  const used = new Set<string>();
  return STAGES.map(({ stage }) => {
    const matchSeed = `${seed}-${stage}`;
    const opponent = pickHistoricalOpponent(stage, matchSeed, used);
    used.add(opponent.country);
    return {
      stage,
      opponentCountry: opponent.country,
      opponentFlagCode: opponent.flagCode,
    };
  });
}

export function getTeamSeed(teamName: string, drafted: DraftedPlayer[]): string {
  const ids = drafted
    .map((d) => d.appearance.id)
    .sort()
    .join("|");
  return `${teamName}::${ids}`;
}

export function simulateTournament(
  teamName: string,
  drafted: DraftedPlayer[],
  language: Language = "es",
  mode: GameMode = "classic",
): TournamentResult {
  const team = buildTeamProfile(drafted);
  const seed = getTeamSeed(teamName, drafted);
  const matches: MatchResult[] = [];
  const usedOpponents = new Set<string>();
  let eliminated = false;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let finalStage = "GROUP_3";
  let advancedOnPenaltiesFinal = false;

  for (const { stage, difficulty: defaultDifficulty } of STAGES) {
    if (eliminated) break;

    const matchSeed = `${seed}-${stage}`;
    const opponent =
      mode === "historico"
        ? pickHistoricalOpponent(stage, matchSeed, usedOpponents)
        : null;
    if (opponent) usedOpponents.add(opponent.country);

    const difficulty = opponent?.difficulty ?? defaultDifficulty;
    const matchScore =
      team.tournamentPower - difficulty + matchPowerJitter(matchSeed);
    const outcome = matchOutcome(matchScore);
    const rawGoals = computeGoals(team, difficulty, matchSeed);

    let result: MatchResult["result"] = "D";
    let advancedOnPenalties = false;
    let eliminatedOnPenalties = false;

    if (outcome === "clear_win" || outcome === "win" || outcome === "narrow_win") {
      result = "W";
    } else if (outcome === "draw") {
      result = "D";
      if (isKnockoutStage(stage)) {
        const wonPen = resolvePenalties(team, difficulty, drafted, matchSeed);
        if (wonPen) {
          advancedOnPenalties = true;
          if (stage === "FINAL") advancedOnPenaltiesFinal = true;
        } else {
          eliminatedOnPenalties = true;
          eliminated = true;
        }
      }
    } else {
      result = "L";
      eliminated = true;
    }

    const { goalsFor: goalsForMatch, goalsAgainst: goalsAgainstMatch } =
      alignGoalsToResult(rawGoals.gf, rawGoals.gc, result, matchSeed);

    matches.push({
      stage,
      opponentDifficulty: difficulty,
      opponentCountry: opponent?.country,
      opponentFlagCode: opponent?.flagCode,
      goalsFor: goalsForMatch,
      goalsAgainst: goalsAgainstMatch,
      result,
      advancedOnPenalties: advancedOnPenalties || undefined,
      eliminatedOnPenalties: eliminatedOnPenalties || undefined,
    });

    goalsFor += goalsForMatch;
    goalsAgainst += goalsAgainstMatch;
    if (result === "W") wins++;
    else if (result === "D") draws++;
    else losses++;

    finalStage = stage;
    if (!eliminated && stage === "FINAL" && (result === "W" || advancedOnPenalties)) {
      finalStage = "FINAL";
    }
  }

  const played = matches.length;
  const champion =
    !eliminated &&
    matches.length === 7 &&
    (matches[matches.length - 1]?.result === "W" ||
      matches[matches.length - 1]?.advancedOnPenalties === true);
  const undefeated = losses === 0;
  const perfect = champion && wins === 7 && draws === 0;

  const badge = computeBadge(champion, undefeated, perfect, matches);
  const score = computeFinalScore(
    badge,
    champion,
    finalStage,
    goalsFor,
    goalsAgainst,
    team,
    seed,
  );

  const narrative = generateNarrative({
    language,
    badge,
    formation: team.formation,
    teamProfile: team,
    matches,
    champion,
    undefeated,
    goalsFor,
    goalsAgainst,
    advancedOnPenaltiesFinal,
  });

  return {
    matches,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    finalStage: champion ? "FINAL" : finalStage,
    champion,
    undefeated,
    perfect,
    badge,
    score,
    narrative,
    teamProfile: team,
    formation: team.formation,
  };
}

function computeBadge(
  champion: boolean,
  undefeated: boolean,
  perfect: boolean,
  matches: MatchResult[],
): Badge {
  if (champion && perfect) return "PERFECT_CHAMPION";
  if (champion && undefeated) return "UNDEFEATED_CHAMPION";
  if (champion) return "CHAMPION";
  const hasPenaltyElim = matches.some((m) => m.eliminatedOnPenalties);
  if (undefeated && (hasPenaltyElim || !champion)) return "UNDEFEATED_ELIMINATED";
  return "ELIMINATED";
}

function computeFinalScore(
  badge: Badge,
  champion: boolean,
  finalStage: string,
  gf: number,
  gc: number,
  team: ReturnType<typeof buildTeamProfile>,
  seed: string,
): number {
  const ranges: Record<Badge, [number, number]> = {
    PERFECT_CHAMPION: [97, 100],
    UNDEFEATED_CHAMPION: [92, 96],
    CHAMPION: [85, 91],
    UNDEFEATED_ELIMINATED: [68, 75],
    ELIMINATED: [0, 67],
  };

  let [min, max] = ranges[badge];
  if (!champion && badge === "ELIMINATED") {
    const stageScores: Record<string, [number, number]> = {
      SF: [76, 84],
      QF: [58, 67],
      R16: [48, 57],
      GROUP_3: [30, 47],
      GROUP_2: [20, 40],
      GROUP_1: [0, 30],
    };
    [min, max] = stageScores[finalStage] ?? [0, 47];
  }

  const jitter = hashToUnit(`${seed}-score`);
  let score = min + jitter * (max - min);
  score += team.balance * 0.2;

  if (champion) {
    score += gf - gc;
    return Math.round(Math.max(score, min));
  }

  score += (gf - gc) * 0.3;
  return Math.round(clamp(score, min, max + 2));
}

/** Exposed for tests */
export function simulateMatchScore(
  tournamentPower: number,
  difficulty: number,
): number {
  return tournamentPower - difficulty;
}

export { STAGES };
