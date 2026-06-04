export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface PlayerWorldCupProfile {
  attack: number;
  defense: number;
  control: number;
  mentality: number;
  physical: number;
  overall: number;
  goals?: number;
  assists?: number;
  matches?: number;
}

export interface Player {
  id: string;
  name: string;
  normalizedName: string;
  countries: string[];
  position: Position;
  worldCupsPlayed: number[];
  profile: PlayerWorldCupProfile;
}

export interface PlayerAppearance {
  id: string;
  playerId: string;
  country: string;
  worldCup: number;
  displayName: string;
  displayCountry: string;
  displayYear: number;
  position: Position;
}

export interface Country {
  id: string;
  name: string;
  nameEs: string;
  flagCode: string;
  flag: string;
  tier: 1 | 2 | 3;
  worldCups: number[];
}

export interface WorldCup {
  year: number;
  host?: string;
}
