/**
 * Download Fjelstul World Cup CSVs from datahub.io into data/raw/
 * Run once: npm run import-data
 */
import { mkdirSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = "https://datahub.io/football/worldcup/_r/-/";
const FILES = ["squads.csv", "players.csv", "player_appearances.csv", "goals.csv", "teams.csv"];
const OUT = join(process.cwd(), "data", "raw");

async function download(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  console.log(`  ${dest} (${buf.length} bytes)`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log("Downloading Fjelstul World Cup Database CSVs...");
  for (const file of FILES) {
    const dest = join(OUT, file);
    if (existsSync(dest)) {
      console.log(`  skip ${file} (exists)`);
      continue;
    }
    await download(BASE + file, dest);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
