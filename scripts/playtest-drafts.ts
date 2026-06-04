/**
 * Simulate 50 random drafts and report balance / coverage metrics.
 * Run: npm run playtest-drafts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { stableHash } from "../src/lib/hash";
import {
  buildCountryCupCombos,
  applyPick,
  generateSpin,
  getEligibleAppearances,
  sortEligibleByContribution,
  picksToDrafted,
  type DataIndexes,
} from "../src/lib/draft";
import { buildTeamProfile } from "../src/lib/scoring";
import { simulateTournament } from "../src/lib/simulation";
import type { GameState } from "../src/types/game";
import { TOTAL_PICKS, INITIAL_REROLLS } from "../src/types/game";
import type { Country, Player, PlayerAppearance } from "../src/types/player";

const dataDir = join(process.cwd(), "src", "data");

function loadIndexes(): DataIndexes {
  const players = JSON.parse(readFileSync(join(dataDir, "players.json"), "utf-8")) as Player[];
  const appearances = JSON.parse(
    readFileSync(join(dataDir, "appearances.json"), "utf-8"),
  ) as PlayerAppearance[];
  const countries = JSON.parse(readFileSync(join(dataDir, "countries.json"), "utf-8")) as Country[];

  const playersById = new Map(players.map((p) => [p.id, p]));
  const appearancesByCountryCup = new Map<string, PlayerAppearance[]>();
  const appearancesById = new Map(appearances.map((a) => [a.id, a]));

  for (const app of appearances) {
    const key = `${app.country}::${app.worldCup}`;
    const list = appearancesByCountryCup.get(key) ?? [];
    list.push(app);
    appearancesByCountryCup.set(key, list);
  }

  const indexes: DataIndexes = {
    countries,
    appearancesByCountryCup,
    playersById,
    countryCupCombos: [],
  };
  indexes.countryCupCombos = buildCountryCupCombos(indexes);
  return { indexes, appearancesById };
}

function simulateDraft(indexes: DataIndexes, appearancesById: Map<string, PlayerAppearance>) {
  const id = `playtest-${indexes.countryCupCombos.length}-${stableHash(String(Math.random()))}`;
  let state: GameState = {
    id,
    teamName: "Playtest XI",
    mode: "classic",
    picks: [],
    rerollsRemaining: INITIAL_REROLLS,
    lockedPlayerIds: [],
    language: "en",
    currentSpin: indexes.countryCupCombos[stableHash(id) % indexes.countryCupCombos.length]!,
  };

  let spinIdx = 0;
  while (state.picks.length < TOTAL_PICKS) {
    const locked = new Set(state.lockedPlayerIds);
    const eligible = sortEligibleByContribution(
      getEligibleAppearances(state.currentSpin!, locked, indexes),
      picksToDrafted(state.picks, appearancesById, indexes.playersById),
      indexes.playersById,
    );
    if (eligible.length === 0) break;
    const pick = eligible[0]!;
    const player = indexes.playersById.get(pick.playerId);
    if (!player) break;
    const nextSpin =
      state.picks.length + 1 < TOTAL_PICKS
        ? generateSpin(state, indexes, ++spinIdx)
        : null;
    state = applyPick(state, pick, player, nextSpin);
  }

  const drafted = picksToDrafted(state.picks, appearancesById, indexes.playersById);
  const team = buildTeamProfile(drafted);
  const result = simulateTournament("Playtest", drafted, "en");
  return { team, result, pickCount: state.picks.length };
}

function main() {
  const { indexes, appearancesById } = loadIndexes();
  const N = 50;
  const powers: number[] = [];
  const balances: number[] = [];
  let incomplete = 0;

  for (let i = 0; i < N; i++) {
    const { team, result, pickCount } = simulateDraft(indexes, appearancesById);
    if (pickCount < TOTAL_PICKS) incomplete++;
    powers.push(team.tournamentPower);
    balances.push(team.balance);
  }

  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  console.log(`Playtest drafts: ${N}`);
  console.log(`Incomplete drafts: ${incomplete}`);
  console.log(`Avg tournament power: ${avg(powers).toFixed(1)}`);
  console.log(`Avg balance: ${avg(balances).toFixed(1)}`);
  console.log(`Power range: ${Math.min(...powers).toFixed(1)} – ${Math.max(...powers).toFixed(1)}`);
}

main();
