/**
 * Generates full MVP dataset: 24 countries, all World Cups, 600+ appearances.
 * Run: npm run generate-data
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const WORLD_CUP_YEARS = [
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982,
  1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022,
];

type Position = "GK" | "DEF" | "MID" | "FWD";

interface CuratedPlayer {
  id: string;
  name: string;
  position: Position;
  countries: string[];
  cups: number[];
  profile: {
    attack: number;
    defense: number;
    control: number;
    mentality: number;
    physical: number;
    overall: number;
  };
}

interface CountryDef {
  id: string;
  name: string;
  nameEs: string;
  flag: string;
  tier: 1 | 2 | 3;
  worldCups: number[];
}

const COUNTRIES: CountryDef[] = [
  { id: "argentina", name: "Argentina", nameEs: "Argentina", flag: "🇦🇷", tier: 1, worldCups: [1930, 1934, 1958, 1962, 1966, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022] },
  { id: "brazil", name: "Brazil", nameEs: "Brasil", flag: "🇧🇷", tier: 1, worldCups: [1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022] },
  { id: "germany", name: "Germany", nameEs: "Alemania", flag: "🇩🇪", tier: 1, worldCups: [1934, 1938, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022] },
  { id: "france", name: "France", nameEs: "Francia", flag: "🇫🇷", tier: 1, worldCups: [1930, 1934, 1938, 1954, 1958, 1966, 1978, 1982, 1986, 1998, 2002, 2006, 2010, 2014, 2018, 2022] },
  { id: "italy", name: "Italy", nameEs: "Italia", flag: "🇮🇹", tier: 1, worldCups: [1934, 1938, 1950, 1954, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014] },
  { id: "spain", name: "Spain", nameEs: "España", flag: "🇪🇸", tier: 1, worldCups: [1934, 1950, 1962, 1966, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022] },
  { id: "netherlands", name: "Netherlands", nameEs: "Países Bajos", flag: "🇳🇱", tier: 1, worldCups: [1934, 1938, 1974, 1978, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2022] },
  { id: "england", name: "England", nameEs: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", tier: 1, worldCups: [1950, 1954, 1958, 1962, 1966, 1970, 1982, 1986, 1990, 1998, 2002, 2006, 2010, 2014, 2018, 2022] },
  { id: "portugal", name: "Portugal", nameEs: "Portugal", flag: "🇵🇹", tier: 2, worldCups: [1966, 1986, 2002, 2006, 2010, 2014, 2018, 2022] },
  { id: "uruguay", name: "Uruguay", nameEs: "Uruguay", flag: "🇺🇾", tier: 2, worldCups: [1930, 1950, 1954, 1962, 1966, 1970, 1974, 1986, 1990, 2002, 2010, 2014, 2018, 2022] },
  { id: "croatia", name: "Croatia", nameEs: "Croacia", flag: "🇭🇷", tier: 2, worldCups: [1998, 2002, 2006, 2014, 2018, 2022] },
  { id: "belgium", name: "Belgium", nameEs: "Bélgica", flag: "🇧🇪", tier: 2, worldCups: [1930, 1934, 1938, 1954, 1970, 1982, 1986, 1990, 1994, 1998, 2002, 2014, 2018, 2022] },
  { id: "mexico", name: "Mexico", nameEs: "México", flag: "🇲🇽", tier: 2, worldCups: [1930, 1950, 1954, 1958, 1962, 1966, 1970, 1978, 1986, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022] },
  { id: "colombia", name: "Colombia", nameEs: "Colombia", flag: "🇨🇴", tier: 2, worldCups: [1962, 1990, 1994, 1998, 2002, 2014, 2018, 2022] },
  { id: "chile", name: "Chile", nameEs: "Chile", flag: "🇨🇱", tier: 2, worldCups: [1930, 1950, 1962, 1966, 1974, 1982, 1998, 2010, 2014] },
  { id: "sweden", name: "Sweden", nameEs: "Suecia", flag: "🇸🇪", tier: 2, worldCups: [1934, 1938, 1950, 1958, 1970, 1974, 1978, 1990, 1994, 2002, 2006, 2018] },
  { id: "denmark", name: "Denmark", nameEs: "Dinamarca", flag: "🇩🇰", tier: 3, worldCups: [1986, 1998, 2002, 2010, 2018, 2022] },
  { id: "poland", name: "Poland", nameEs: "Polonia", flag: "🇵🇱", tier: 3, worldCups: [1938, 1974, 1978, 1982, 1986, 2002, 2006, 2018, 2022] },
  { id: "serbia", name: "Serbia", nameEs: "Serbia", flag: "🇷🇸", tier: 3, worldCups: [1998, 2002, 2006, 2010, 2018, 2022] },
  { id: "czech", name: "Czech Republic", nameEs: "Rep. Checa", flag: "🇨🇿", tier: 3, worldCups: [2006] },
  { id: "hungary", name: "Hungary", nameEs: "Hungría", flag: "🇭🇺", tier: 3, worldCups: [1934, 1938, 1954, 1958, 1962, 1966, 1978, 1982, 1986] },
  { id: "cameroon", name: "Cameroon", nameEs: "Camerún", flag: "🇨🇲", tier: 3, worldCups: [1982, 1990, 1994, 1998, 2002, 2010, 2014, 2022] },
  { id: "nigeria", name: "Nigeria", nameEs: "Nigeria", flag: "🇳🇬", tier: 3, worldCups: [1994, 1998, 2002, 2010, 2014, 2018] },
  { id: "morocco", name: "Morocco", nameEs: "Marruecos", flag: "🇲🇦", tier: 3, worldCups: [1970, 1986, 1994, 1998, 2018, 2022] },
];

/** Curated legends — expanded per country */
const CURATED: CuratedPlayer[] = [
  { id: "lionel-messi", name: "Lionel Messi", position: "FWD", countries: ["Argentina"], cups: [2006, 2010, 2014, 2018, 2022], profile: { attack: 96, defense: 42, control: 95, mentality: 94, physical: 72, overall: 96 } },
  { id: "diego-maradona", name: "Diego Maradona", position: "MID", countries: ["Argentina"], cups: [1982, 1986, 1990, 1994], profile: { attack: 92, defense: 48, control: 97, mentality: 98, physical: 78, overall: 97 } },
  { id: "gabriel-batistuta", name: "Gabriel Batistuta", position: "FWD", countries: ["Argentina"], cups: [1994, 1998, 2002], profile: { attack: 93, defense: 40, control: 78, mentality: 85, physical: 88, overall: 90 } },
  { id: "javier-mascherano", name: "Javier Mascherano", position: "MID", countries: ["Argentina"], cups: [2006, 2010, 2014, 2018], profile: { attack: 55, defense: 88, control: 82, mentality: 90, physical: 85, overall: 86 } },
  { id: "emiliano-martinez", name: "Emiliano Martínez", position: "GK", countries: ["Argentina"], cups: [2022], profile: { attack: 12, defense: 90, control: 70, mentality: 92, physical: 88, overall: 91 } },
  { id: "pele", name: "Pelé", position: "FWD", countries: ["Brazil"], cups: [1958, 1962, 1966, 1970], profile: { attack: 98, defense: 45, control: 92, mentality: 97, physical: 85, overall: 98 } },
  { id: "ronaldo-nazario", name: "Ronaldo Nazário", position: "FWD", countries: ["Brazil"], cups: [1994, 1998, 2002, 2006], profile: { attack: 97, defense: 38, control: 88, mentality: 90, physical: 90, overall: 96 } },
  { id: "ronaldinho", name: "Ronaldinho", position: "MID", countries: ["Brazil"], cups: [2002, 2006], profile: { attack: 90, defense: 42, control: 98, mentality: 88, physical: 82, overall: 94 } },
  { id: "rivaldo", name: "Rivaldo", position: "MID", countries: ["Brazil"], cups: [1998, 2002], profile: { attack: 91, defense: 48, control: 92, mentality: 88, physical: 80, overall: 92 } },
  { id: "cafu", name: "Cafu", position: "DEF", countries: ["Brazil"], cups: [1994, 1998, 2002, 2006], profile: { attack: 72, defense: 88, control: 82, mentality: 92, physical: 86, overall: 91 } },
  { id: "roberto-carlos", name: "Roberto Carlos", position: "DEF", countries: ["Brazil"], cups: [1998, 2002, 2006], profile: { attack: 85, defense: 82, control: 80, mentality: 86, physical: 88, overall: 90 } },
  { id: "neymar", name: "Neymar", position: "FWD", countries: ["Brazil"], cups: [2014, 2018, 2022], profile: { attack: 93, defense: 40, control: 92, mentality: 82, physical: 78, overall: 91 } },
  { id: "franz-beckenbauer", name: "Franz Beckenbauer", position: "DEF", countries: ["Germany"], cups: [1966, 1970, 1974], profile: { attack: 78, defense: 95, control: 92, mentality: 96, physical: 85, overall: 96 } },
  { id: "gerd-muller", name: "Gerd Müller", position: "FWD", countries: ["Germany"], cups: [1970, 1974], profile: { attack: 97, defense: 38, control: 80, mentality: 92, physical: 82, overall: 95 } },
  { id: "miroslav-klose", name: "Miroslav Klose", position: "FWD", countries: ["Germany"], cups: [2002, 2006, 2010, 2014], profile: { attack: 92, defense: 42, control: 78, mentality: 90, physical: 85, overall: 91 } },
  { id: "manuel-neuer", name: "Manuel Neuer", position: "GK", countries: ["Germany"], cups: [2010, 2014, 2018, 2022], profile: { attack: 15, defense: 92, control: 78, mentality: 90, physical: 88, overall: 92 } },
  { id: "zinedine-zidane", name: "Zinedine Zidane", position: "MID", countries: ["France"], cups: [1998, 2002, 2006], profile: { attack: 88, defense: 55, control: 98, mentality: 94, physical: 82, overall: 96 } },
  { id: "thierry-henry", name: "Thierry Henry", position: "FWD", countries: ["France"], cups: [1998, 2002, 2006, 2010], profile: { attack: 94, defense: 42, control: 88, mentality: 88, physical: 88, overall: 93 } },
  { id: "kylian-mbappe", name: "Kylian Mbappé", position: "FWD", countries: ["France"], cups: [2018, 2022], profile: { attack: 95, defense: 38, control: 88, mentality: 90, physical: 94, overall: 94 } },
  { id: "hugo-lloris", name: "Hugo Lloris", position: "GK", countries: ["France"], cups: [2010, 2014, 2018, 2022], profile: { attack: 12, defense: 86, control: 72, mentality: 88, physical: 85, overall: 88 } },
  { id: "paolo-maldini", name: "Paolo Maldini", position: "DEF", countries: ["Italy"], cups: [1990, 1994, 1998, 2002], profile: { attack: 65, defense: 96, control: 85, mentality: 92, physical: 88, overall: 94 } },
  { id: "roberto-baggio", name: "Roberto Baggio", position: "FWD", countries: ["Italy"], cups: [1990, 1994, 1998], profile: { attack: 93, defense: 42, control: 92, mentality: 90, physical: 75, overall: 93 } },
  { id: "andrea-pirlo", name: "Andrea Pirlo", position: "MID", countries: ["Italy"], cups: [2002, 2006, 2010, 2014], profile: { attack: 78, defense: 62, control: 97, mentality: 92, physical: 72, overall: 93 } },
  { id: "xavi", name: "Xavi", position: "MID", countries: ["Spain"], cups: [2006, 2010, 2014], profile: { attack: 75, defense: 58, control: 98, mentality: 92, physical: 72, overall: 94 } },
  { id: "andres-iniesta", name: "Andrés Iniesta", position: "MID", countries: ["Spain"], cups: [2006, 2010, 2014, 2018], profile: { attack: 82, defense: 55, control: 97, mentality: 96, physical: 75, overall: 95 } },
  { id: "iker-casillas", name: "Iker Casillas", position: "GK", countries: ["Spain"], cups: [2002, 2006, 2010, 2014], profile: { attack: 12, defense: 90, control: 72, mentality: 94, physical: 82, overall: 92 } },
  { id: "johan-cruyff", name: "Johan Cruyff", position: "FWD", countries: ["Netherlands"], cups: [1974], profile: { attack: 94, defense: 48, control: 96, mentality: 92, physical: 80, overall: 95 } },
  { id: "marco-van-basten", name: "Marco van Basten", position: "FWD", countries: ["Netherlands"], cups: [1990], profile: { attack: 96, defense: 42, control: 88, mentality: 90, physical: 85, overall: 94 } },
  { id: "arjen-robben", name: "Arjen Robben", position: "FWD", countries: ["Netherlands"], cups: [2006, 2010, 2014], profile: { attack: 92, defense: 40, control: 88, mentality: 85, physical: 82, overall: 90 } },
  { id: "bobby-charlton", name: "Bobby Charlton", position: "MID", countries: ["England"], cups: [1966, 1970], profile: { attack: 90, defense: 55, control: 90, mentality: 92, physical: 82, overall: 93 } },
  { id: "gary-lineker", name: "Gary Lineker", position: "FWD", countries: ["England"], cups: [1986, 1990], profile: { attack: 90, defense: 40, control: 78, mentality: 85, physical: 80, overall: 88 } },
  { id: "david-beckham", name: "David Beckham", position: "MID", countries: ["England"], cups: [1998, 2002, 2006], profile: { attack: 82, defense: 58, control: 90, mentality: 88, physical: 78, overall: 89 } },
  { id: "harry-kane", name: "Harry Kane", position: "FWD", countries: ["England"], cups: [2018, 2022], profile: { attack: 93, defense: 42, control: 82, mentality: 88, physical: 82, overall: 91 } },
  { id: "cristiano-ronaldo", name: "Cristiano Ronaldo", position: "FWD", countries: ["Portugal"], cups: [2006, 2010, 2014, 2018, 2022], profile: { attack: 96, defense: 42, control: 88, mentality: 94, physical: 92, overall: 95 } },
  { id: "eusebio", name: "Eusébio", position: "FWD", countries: ["Portugal"], cups: [1966], profile: { attack: 95, defense: 40, control: 85, mentality: 90, physical: 88, overall: 93 } },
  { id: "luis-suarez", name: "Luis Suárez", position: "FWD", countries: ["Uruguay"], cups: [2010, 2014, 2018, 2022], profile: { attack: 92, defense: 42, control: 82, mentality: 88, physical: 85, overall: 91 } },
  { id: "diego-forlan", name: "Diego Forlán", position: "FWD", countries: ["Uruguay"], cups: [2002, 2010, 2014], profile: { attack: 90, defense: 45, control: 88, mentality: 90, physical: 80, overall: 90 } },
  { id: "luka-modric", name: "Luka Modrić", position: "MID", countries: ["Croatia"], cups: [2006, 2014, 2018, 2022], profile: { attack: 78, defense: 62, control: 96, mentality: 94, physical: 75, overall: 93 } },
  { id: "eden-hazard", name: "Eden Hazard", position: "FWD", countries: ["Belgium"], cups: [2014, 2018, 2022], profile: { attack: 90, defense: 42, control: 92, mentality: 82, physical: 80, overall: 90 } },
  { id: "hugo-sanchez", name: "Hugo Sánchez", position: "FWD", countries: ["Mexico"], cups: [1978, 1986, 1994], profile: { attack: 92, defense: 40, control: 82, mentality: 85, physical: 82, overall: 89 } },
  { id: "carlos-valderrama", name: "Carlos Valderrama", position: "MID", countries: ["Colombia"], cups: [1990, 1994, 1998], profile: { attack: 72, defense: 55, control: 94, mentality: 85, physical: 72, overall: 88 } },
  { id: "james-rodriguez", name: "James Rodríguez", position: "MID", countries: ["Colombia"], cups: [2014, 2018, 2022], profile: { attack: 88, defense: 48, control: 90, mentality: 85, physical: 78, overall: 89 } },
  { id: "roger-milla", name: "Roger Milla", position: "FWD", countries: ["Cameroon"], cups: [1990, 1994], profile: { attack: 88, defense: 40, control: 78, mentality: 92, physical: 80, overall: 88 } },
  { id: "jay-jay-okocha", name: "Jay-Jay Okocha", position: "MID", countries: ["Nigeria"], cups: [1994, 1998, 2002], profile: { attack: 85, defense: 48, control: 94, mentality: 85, physical: 82, overall: 89 } },
  { id: "achraf-hakimi", name: "Achraf Hakimi", position: "DEF", countries: ["Morocco"], cups: [2018, 2022], profile: { attack: 78, defense: 85, control: 82, mentality: 88, physical: 90, overall: 88 } },
];

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function eraMultiplier(year: number): number {
  if (year < 1950) return 0.72;
  if (year < 1970) return 0.82;
  if (year < 1990) return 0.9;
  return 1;
}

function generateSquadFillers(
  country: CountryDef,
  year: number,
  existingIds: Set<string>,
  playersMap: Map<string, CuratedPlayer>,
): void {
  const positions: Position[] = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "MID", "FWD", "FWD", "FWD", "FWD", "FWD", "GK", "DEF", "MID", "FWD"];
  const mult = eraMultiplier(year);
  const tierBoost = country.tier === 1 ? 8 : country.tier === 2 ? 4 : 0;

  let idx = 0;
  for (const pos of positions) {
    const id = `${country.id}-gen-${year}-${pos.toLowerCase()}-${idx}`;
    idx++;
    if (existingIds.has(id)) continue;

    const baseOverall = Math.round((62 + tierBoost + (idx % 12)) * mult);
    const profile = {
      attack: pos === "FWD" ? baseOverall + 8 : pos === "MID" ? baseOverall : baseOverall - 15,
      defense: pos === "GK" || pos === "DEF" ? baseOverall + 5 : baseOverall - 20,
      control: pos === "MID" ? baseOverall + 5 : baseOverall - 10,
      mentality: baseOverall,
      physical: baseOverall - 5,
      overall: baseOverall,
    };

    playersMap.set(id, {
      id,
      name: `${country.name} ${pos} ${year} #${idx}`,
      position: pos,
      countries: [country.name],
      cups: [year],
      profile: {
        attack: clamp(profile.attack),
        defense: clamp(profile.defense),
        control: clamp(profile.control),
        mentality: clamp(profile.mentality),
        physical: clamp(profile.physical),
        overall: clamp(profile.overall),
      },
    });
    existingIds.add(id);
  }
}

function clamp(n: number): number {
  return Math.max(45, Math.min(96, n));
}

const playersMap = new Map<string, CuratedPlayer>();
for (const p of CURATED) {
  playersMap.set(p.id, p);
}

const appearances: Array<{
  id: string;
  playerId: string;
  country: string;
  worldCup: number;
  displayName: string;
  displayCountry: string;
  displayYear: number;
  position: Position;
}> = [];

for (const country of COUNTRIES) {
  for (const year of country.worldCups) {
    if (!WORLD_CUP_YEARS.includes(year)) continue;

    const squadPlayerIds = new Set<string>();

    for (const player of playersMap.values()) {
      if (!player.countries.includes(country.name)) continue;
      if (!player.cups.includes(year)) continue;
      const appId = `${player.id}-${slug(country.name)}-${year}`;
      if (squadPlayerIds.has(player.id)) continue;
      squadPlayerIds.add(player.id);
      appearances.push({
        id: appId,
        playerId: player.id,
        country: country.name,
        worldCup: year,
        displayName: player.name,
        displayCountry: country.name,
        displayYear: year,
        position: player.position,
      });
    }

    generateSquadFillers(country, year, squadPlayerIds, playersMap);

    for (const player of playersMap.values()) {
      if (!player.id.startsWith(`${country.id}-gen-${year}`)) continue;
      appearances.push({
        id: `${player.id}-app`,
        playerId: player.id,
        country: country.name,
        worldCup: year,
        displayName: player.name,
        displayCountry: country.name,
        displayYear: year,
        position: player.position,
      });
    }
  }
}

const players = Array.from(playersMap.values()).map((p) => ({
  id: p.id,
  name: p.name,
  normalizedName: slug(p.name),
  countries: p.countries,
  position: p.position,
  worldCupsPlayed: [...new Set(p.cups)].sort((a, b) => a - b),
  profile: p.profile,
}));

const worldcups = WORLD_CUP_YEARS.map((year) => ({ year }));

const dataDir = join(process.cwd(), "src", "data");
mkdirSync(dataDir, { recursive: true });

writeFileSync(join(dataDir, "players.json"), JSON.stringify(players, null, 0));
writeFileSync(join(dataDir, "appearances.json"), JSON.stringify(appearances, null, 0));
writeFileSync(join(dataDir, "countries.json"), JSON.stringify(COUNTRIES, null, 2));
writeFileSync(join(dataDir, "worldcups.json"), JSON.stringify(worldcups, null, 2));

console.log(`Generated ${players.length} players, ${appearances.length} appearances, ${COUNTRIES.length} countries`);
