import type { Country, Player, PlayerAppearance, WorldCup } from "@/types/player";
import type { Language } from "@/types/simulation";
import type { Spin } from "@/types/game";
import {
  buildCountryCupCombos,
  generateSpin,
  type DataIndexes,
} from "./draft";
import type { GameState } from "@/types/game";

import playersJson from "@/data/players.json";
import appearancesJson from "@/data/appearances.json";
import countriesJson from "@/data/countries.json";
import worldcupsJson from "@/data/worldcups.json";

let cachedIndexes: DataIndexes | null = null;
let cachedAppearancesById: Map<string, PlayerAppearance> | null = null;

function comboKey(country: string, worldCup: number): string {
  return `${country}::${worldCup}`;
}

export function loadData(): DataIndexes {
  if (cachedIndexes) return cachedIndexes;

  const players = playersJson as Player[];
  const appearances = appearancesJson as PlayerAppearance[];
  const countries = countriesJson as Country[];

  const playersById = new Map(players.map((p) => [p.id, p]));
  const appearancesByCountryCup = new Map<string, PlayerAppearance[]>();

  for (const app of appearances) {
    const key = comboKey(app.country, app.worldCup);
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
  cachedIndexes = indexes;
  return indexes;
}

export function getAppearancesById(): Map<string, PlayerAppearance> {
  if (cachedAppearancesById) return cachedAppearancesById;
  const appearances = appearancesJson as PlayerAppearance[];
  cachedAppearancesById = new Map(appearances.map((a) => [a.id, a]));
  return cachedAppearancesById;
}

export function getCountries(): Country[] {
  return countriesJson as Country[];
}

export function getWorldCups(): WorldCup[] {
  return worldcupsJson as WorldCup[];
}

export function getCountryByName(name: string): Country | undefined {
  return getCountries().find((c) => c.name === name);
}

export function getCountryDisplayName(country: string, locale: Language): string {
  const c = getCountryByName(country);
  if (!c) return country;
  return locale === "es" ? c.nameEs : c.name;
}

export function getFlagCodeForCountry(name: string): string | null {
  const code = getCountryByName(name)?.flagCode?.trim();
  return code || null;
}

export function getFlagSrcForCountry(name: string): string | null {
  return getCountryByName(name)?.flagSrc ?? null;
}

/** @deprecated Use CountryFlag component for UI; emoji flags break on Windows */
export function getFlagForCountry(name: string): string {
  return getCountryByName(name)?.flag ?? "🏳️";
}

export function getInitialSpin(gameState: GameState, indexes?: DataIndexes): Spin {
  const idx = indexes ?? loadData();
  return generateSpin(
    { ...gameState, picks: [], currentSpin: null },
    idx,
    0,
  );
}

export function getDataStats() {
  const players = playersJson as Player[];
  const appearances = appearancesJson as PlayerAppearance[];
  return {
    players: players.length,
    appearances: appearances.length,
    countries: (countriesJson as Country[]).length,
    combos: loadData().countryCupCombos.length,
  };
}
