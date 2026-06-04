import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const PositionSchema = z.enum(["GK", "DEF", "MID", "FWD"]);

const ProfileSchema = z.object({
  attack: z.number().min(1).max(100),
  defense: z.number().min(1).max(100),
  control: z.number().min(1).max(100),
  mentality: z.number().min(1).max(100),
  physical: z.number().min(1).max(100),
  overall: z.number().min(1).max(100),
});

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  normalizedName: z.string(),
  countries: z.array(z.string()),
  position: PositionSchema,
  worldCupsPlayed: z.array(z.number()),
  profile: ProfileSchema,
});

const AppearanceSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  country: z.string(),
  worldCup: z.number(),
  displayName: z.string(),
  displayCountry: z.string(),
  displayYear: z.number(),
  position: PositionSchema,
});

const dataDir = join(process.cwd(), "src", "data");

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(dataDir, file), "utf-8")) as T;
}

const players = z.array(PlayerSchema).parse(loadJson("players.json"));
const appearances = z.array(AppearanceSchema).parse(loadJson("appearances.json"));
const countries = loadJson<Array<{ name: string; worldCups: number[] }>>("countries.json");
const poolsSchema = z.object({
  group: z.array(z.string()).min(1),
  R16: z.array(z.string()).min(1),
  QF: z.array(z.string()).min(1),
  SF: z.array(z.string()).min(1),
  FINAL: z.array(z.string()).min(1),
});
const pools = poolsSchema.parse(loadJson("tournament-pools.json"));

const playerIds = new Set(players.map((p) => p.id));
const appearanceIds = new Set<string>();
let errors = 0;

for (const player of players) {
  if (/not applicable/i.test(player.name)) {
    console.error(`Invalid player name: ${player.id} -> ${player.name}`);
    errors++;
  }
}

for (const app of appearances) {
  if (/not applicable/i.test(app.displayName)) {
    console.error(`Invalid appearance name: ${app.id} -> ${app.displayName}`);
    errors++;
  }
  if (appearanceIds.has(app.id)) {
    console.error(`Duplicate appearance id: ${app.id}`);
    errors++;
  }
  appearanceIds.add(app.id);

  if (!playerIds.has(app.playerId)) {
    console.error(`Orphan appearance: ${app.id} -> ${app.playerId}`);
    errors++;
  }
}

const comboCounts = new Map<string, number>();
for (const app of appearances) {
  const key = `${app.country}::${app.worldCup}`;
  comboCounts.set(key, (comboCounts.get(key) ?? 0) + 1);
}

for (const country of countries) {
  for (const year of country.worldCups) {
    const key = `${country.name}::${year}`;
    const count = comboCounts.get(key) ?? 0;
    if (count < 5) {
      console.error(`Thin squad: ${key} has only ${count} players`);
      errors++;
    }
  }
}

const countryNames = new Set(countries.map((c) => c.name));
for (const [stage, list] of Object.entries(pools) as [string, string[]][]) {
  for (const team of list) {
    if (!countryNames.has(team)) {
      console.error(`FAIL: pool ${stage} has unknown country "${team}"`);
      errors++;
    }
  }
}

console.log(`Players: ${players.length}`);
console.log(`Appearances: ${appearances.length}`);
console.log(`Country-Cup combos: ${comboCounts.size}`);
console.log(
  `Historical pools: group ${pools.group.length}, R16 ${pools.R16.length}, FINAL ${pools.FINAL.length}`,
);

if (appearances.length < 600) {
  console.error(`FAIL: Need 600+ appearances, got ${appearances.length}`);
  errors++;
}

const genericPlayers = players.filter((p) => p.id.includes("-gen-"));
if (genericPlayers.length > 0) {
  console.error(`FAIL: ${genericPlayers.length} generic placeholder players remain`);
  errors++;
}

if (players.length < 3000) {
  console.error(`FAIL: Need 3000+ unique players, got ${players.length}`);
  errors++;
}

if (appearances.length < 6000) {
  console.error(`FAIL: Need 6000+ appearances, got ${appearances.length}`);
  errors++;
}

if (countries.length < 24) {
  console.error(`FAIL: Need 24 countries, got ${countries.length}`);
  errors++;
}

if (errors > 0) {
  process.exit(1);
}

console.log("Data validation passed.");
