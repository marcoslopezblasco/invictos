export const WORLD_CUP_YEARS = [
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982,
  1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022,
] as const;

export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface CountryDef {
  id: string;
  name: string;
  nameEs: string;
  flag: string;
  tier: 1 | 2 | 3;
  worldCups: number[];
}

export const COUNTRIES: CountryDef[] = [
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
  {
    id: "serbia",
    name: "Serbia",
    nameEs: "Serbia",
    flag: "🇷🇸",
    tier: 3,
    worldCups: [1930, 1938, 1950, 1954, 1958, 1962, 1966, 1974, 1982, 1990, 1998, 2002, 2006, 2010, 2018, 2022],
  },
  {
    id: "czech",
    name: "Czech Republic",
    nameEs: "Rep. Checa",
    flag: "🇨🇿",
    tier: 3,
    worldCups: [1934, 1938, 1954, 1958, 1962, 1970, 1982, 1990, 2006],
  },
  { id: "hungary", name: "Hungary", nameEs: "Hungría", flag: "🇭🇺", tier: 3, worldCups: [1934, 1938, 1954, 1958, 1962, 1966, 1978, 1982, 1986] },
  { id: "cameroon", name: "Cameroon", nameEs: "Camerún", flag: "🇨🇲", tier: 3, worldCups: [1982, 1990, 1994, 1998, 2002, 2010, 2014, 2022] },
  { id: "nigeria", name: "Nigeria", nameEs: "Nigeria", flag: "🇳🇬", tier: 3, worldCups: [1994, 1998, 2002, 2010, 2014, 2018] },
  { id: "morocco", name: "Morocco", nameEs: "Marruecos", flag: "🇲🇦", tier: 3, worldCups: [1970, 1986, 1994, 1998, 2018, 2022] },
];

/** Map Fjelstul / historical team names → Invictos country name */
export const TEAM_NAME_ALIASES: Record<string, string> = {
  "West Germany": "Germany",
  "Germany FR": "Germany",
  "Czechoslovakia": "Czech Republic",
  Yugoslavia: "Serbia",
  "Serbia and Montenegro": "Serbia",
  "FR Yugoslavia": "Serbia",
};

export const COUNTRY_NAMES = new Set(COUNTRIES.map((c) => c.name));

export function canonicalTeamName(raw: string): string | null {
  const mapped = TEAM_NAME_ALIASES[raw] ?? raw;
  return COUNTRY_NAMES.has(mapped) ? mapped : null;
}

export function parseTournamentYear(tournamentName: string): number | null {
  const m = tournamentName.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

export function mapPosition(code: string): Position | null {
  const c = code.toUpperCase();
  if (c === "GK") return "GK";
  if (c === "DF") return "DEF";
  if (c === "MF") return "MID";
  if (c === "FW") return "FWD";
  return null;
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PLACEHOLDER_NAME = /^(not applicable|n\/a|na|unknown|none|null|-+|\.)$/i;

/** Fjelstul CSV uses "not applicable" when a name field is missing (common for mononyms). */
export function sanitizeNamePart(value: string): string {
  const t = value?.trim() ?? "";
  if (!t || PLACEHOLDER_NAME.test(t)) return "";
  return t;
}

export function formatPlayerName(given: string, family: string): string {
  const g = sanitizeNamePart(given);
  const f = sanitizeNamePart(family);
  if (g && f) return `${g} ${f}`;
  return g || f || "Unknown Player";
}

/** @deprecated Use formatPlayerName */
export function fullName(given: string, family: string): string {
  return formatPlayerName(given, family);
}
