import type { Player } from "@/types/player";
import type { DraftedPlayer, TeamProfile } from "@/types/simulation";
import { countPositions } from "@/types/simulation";
import {
  calculateBalanceScore,
  getFormationString,
} from "./formations";

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function avgTopWeighted(values: number[], weight: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => b - a);
  const top = sorted[0] ?? 0;
  const rest = sorted.slice(1);
  const restAvg = rest.length ? avg(rest) : top * 0.7;
  return top * weight + restAvg * (1 - weight);
}

function byPosition(players: DraftedPlayer[], pos: Player["position"]) {
  return players.filter((p) => p.appearance.position === pos);
}

/** Scale defensive ratings when the XI has too few defenders. */
function defenderDepthMultiplier(defCount: number): number {
  if (defCount >= 4) return 1;
  if (defCount === 3) return 0.92;
  if (defCount === 2) return 0.72;
  if (defCount === 1) return 0.52;
  return 0.35;
}

export function buildTeamProfile(players: DraftedPlayer[]): TeamProfile {
  const counts = countPositions(players);
  const fwd = byPosition(players, "FWD");
  const def = byPosition(players, "DEF");
  const mid = byPosition(players, "MID");
  const gk = byPosition(players, "GK");

  const allProfiles = players.map((p) => p.player.profile);
  const teamMentality = avg(allProfiles.map((p) => p.mentality));
  const physicality = avg(allProfiles.map((p) => p.physical));

  const attackPower =
    avgTopWeighted(
      fwd.map((p) => p.player.profile.attack),
      0.45,
    ) +
    avg(mid.map((p) => p.player.profile.attack)) * 0.2 +
    avg(mid.map((p) => p.player.profile.control)) * 0.2 +
    teamMentality * 0.1 +
    physicality * 0.05;

  const hasGk = gk.length > 0;
  const gkOverall = hasGk ? (gk[0]?.player.profile.overall ?? 50) : 28;

  let defensiveSecurity =
    avg(def.map((p) => p.player.profile.defense)) * 0.4 +
    avg(mid.map((p) => p.player.profile.defense)) * 0.2 +
    gkOverall * 0.25 +
    teamMentality * 0.1 +
    physicality * 0.05;

  defensiveSecurity *= defenderDepthMultiplier(counts.DEF);
  if (!hasGk) defensiveSecurity *= 0.7;

  const midfieldControl =
    avg(mid.map((p) => p.player.profile.control)) * 0.5 +
    avg(mid.map((p) => p.player.profile.mentality)) * 0.2 +
    avg(mid.map((p) => p.player.profile.physical)) * 0.1 +
    avg(def.map((p) => p.player.profile.control)) * 0.1 +
    avg(fwd.map((p) => p.player.profile.control)) * 0.1;

  const balance = calculateBalanceScore(counts);

  const tournamentPower =
    attackPower * 0.28 +
    defensiveSecurity * 0.28 +
    midfieldControl * 0.24 +
    teamMentality * 0.12 +
    balance;

  return {
    attackPower: round2(attackPower),
    defensiveSecurity: round2(defensiveSecurity),
    midfieldControl: round2(midfieldControl),
    mentality: round2(teamMentality),
    physicality: round2(physicality),
    balance: round2(balance),
    goalkeeperQuality: round2(gkOverall),
    tournamentPower: round2(tournamentPower),
    formation: getFormationString(counts),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateMarginalContribution(
  player: Player,
  currentTeam: DraftedPlayer[],
): number {
  const without = buildTeamProfile(currentTeam).tournamentPower;
  const mockAppearance = {
    id: "mock",
    playerId: player.id,
    country: player.countries[0] ?? "",
    worldCup: 0,
    displayName: player.name,
    displayCountry: player.countries[0] ?? "",
    displayYear: 0,
    position: player.position,
  };
  const withPlayer: DraftedPlayer[] = [
    ...currentTeam,
    { appearance: mockAppearance, player },
  ];
  const withPower = buildTeamProfile(withPlayer).tournamentPower;
  return withPower - without;
}
