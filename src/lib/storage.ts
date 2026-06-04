import type { GameMode, Language, TournamentResult } from "@/types/simulation";
import type { DraftPick } from "@/types/game";
import type { PlayerAppearance } from "@/types/player";

const TEAM_NAME_KEY = "invictos_team_name";
const LOCALE_KEY = "invictos_locale";
const MODE_KEY = "invictos_mode";
const RESULTS_KEY = "invictos_results";
const ACTIVE_GAME_KEY = "invictos_active_game";

export interface SavedResult {
  id: string;
  teamName: string;
  mode: GameMode;
  language: Language;
  formation: string;
  badge: TournamentResult["badge"];
  score: number;
  tournament: TournamentResult;
  picks: DraftPick[];
  appearances: PlayerAppearance[];
  timestamp: number;
}

export interface ActiveGameSession {
  gameStateJson: string;
}

export function getTeamName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TEAM_NAME_KEY);
}

export function setTeamName(name: string): void {
  localStorage.setItem(TEAM_NAME_KEY, name);
}

export function getLocale(): Language | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(LOCALE_KEY);
  return v === "en" || v === "es" ? v : null;
}

export function setLocale(locale: Language): void {
  localStorage.setItem(LOCALE_KEY, locale);
}

export function getSavedMode(): GameMode | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(MODE_KEY);
  return v === "classic" || v === "blind" || v === "historico" || v === "hardcore"
    ? v
    : null;
}

export function setSavedMode(mode: GameMode): void {
  localStorage.setItem(MODE_KEY, mode);
}

export function saveResult(result: SavedResult): void {
  const existing = getRecentResults();
  const filtered = existing.filter((r) => r.id !== result.id);
  const next = [result, ...filtered].slice(0, 20);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(next));
}

export function getRecentResults(): SavedResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedResult[];
  } catch {
    return [];
  }
}

export function getResultById(id: string): SavedResult | null {
  return getRecentResults().find((r) => r.id === id) ?? null;
}

export function saveActiveGame(session: ActiveGameSession): void {
  sessionStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(session));
}

export function getActiveGame(): ActiveGameSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_GAME_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveGameSession;
  } catch {
    return null;
  }
}

export function clearActiveGame(): void {
  sessionStorage.removeItem(ACTIVE_GAME_KEY);
}
