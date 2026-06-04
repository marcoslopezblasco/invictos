import type { Language } from "@/types/simulation";

export type Locale = Language;

const translations: Record<Locale, Record<string, string>> = {
  es: {
    "app.title": "Invictos",
    "app.claim": "Draftea un XI histórico. Simula un Mundial. Descubre si puedes ganarlo invicto.",
    "home.play": "Jugar",
    "home.how": "Cómo funciona",
    "home.classic": "Classic",
    "home.blind": "Blind",
    "name.title": "¿Cómo se llama tu XI?",
    "name.placeholder": "Los Invictos de Marcos",
    "name.start": "Empezar",
    "name.random": "Nombre aleatorio",
    "draft.pick": "Pick",
    "draft.rerolls": "Rerolls",
    "draft.choose": "Elige un jugador",
    "draft.reroll": "Reroll",
    "slots.gk": "GK",
    "slots.def": "DEF",
    "slots.mid": "MID",
    "slots.fwd": "FWD",
    "review.title": "Tu XI está listo",
    "review.simulate": "Simular Mundial",
    "result.share": "Compartir",
    "result.copy": "Copiar resultado",
    "share.cta": "¿Tu XI puede superar al mío?",
    "badge.PERFECT_CHAMPION": "Campeón Perfecto",
    "badge.UNDEFEATED_CHAMPION": "Campeón Invicto",
    "badge.CHAMPION": "Campeón",
    "badge.UNDEFEATED_ELIMINATED": "Invicto Eliminado",
    "badge.ELIMINATED": "Eliminado",
    "how.title": "Cómo funciona",
    "how.body":
      "1. Elige modo Classic o Blind.\n2. Draftea 11 jugadores mundialistas (País + Mundial por ronda).\n3. Tienes 3 rerolls.\n4. No puedes repetir jugador.\n5. Simula un Mundial de 7 partidos.\n6. Descubre si tu XI gana invicto.",
    "recent.title": "Partidas recientes",
  },
  en: {
    "app.title": "Invictos",
    "app.claim": "Draft a historic XI. Simulate a World Cup. See if you can win it undefeated.",
    "home.play": "Play",
    "home.how": "How it works",
    "home.classic": "Classic",
    "home.blind": "Blind",
    "name.title": "What is your XI called?",
    "name.placeholder": "Marco's Invictos",
    "name.start": "Start",
    "name.random": "Random name",
    "draft.pick": "Pick",
    "draft.rerolls": "Rerolls",
    "draft.choose": "Choose a player",
    "draft.reroll": "Reroll",
    "slots.gk": "GK",
    "slots.def": "DEF",
    "slots.mid": "MID",
    "slots.fwd": "FWD",
    "review.title": "Your XI is ready",
    "review.simulate": "Simulate World Cup",
    "result.share": "Share",
    "result.copy": "Copy result",
    "share.cta": "Can your XI beat mine?",
    "badge.PERFECT_CHAMPION": "Perfect Champion",
    "badge.UNDEFEATED_CHAMPION": "Undefeated Champion",
    "badge.CHAMPION": "Champion",
    "badge.UNDEFEATED_ELIMINATED": "Undefeated Eliminated",
    "badge.ELIMINATED": "Eliminated",
    "how.title": "How it works",
    "how.body":
      "1. Pick Classic or Blind mode.\n2. Draft 11 World Cup players (Country + World Cup each round).\n3. You get 3 rerolls.\n4. No duplicate players.\n5. Simulate a 7-match World Cup.\n6. See if your XI wins undefeated.",
    "recent.title": "Recent games",
  },
};

export function detectLanguage(): Locale {
  if (typeof navigator === "undefined") return "es";
  const lang = navigator.language.toLowerCase();
  return lang.startsWith("en") ? "en" : "es";
}

export function t(locale: Locale, key: string): string {
  return translations[locale][key] ?? key;
}

export const RANDOM_TEAM_NAMES = {
  es: [
    "La Máquina Histórica",
    "XI Imposible",
    "Los Invictos",
    "El Equipo Prohibido",
    "Mundial Legends",
    "Chaos XI",
    "La Selección Definitiva",
  ],
  en: [
    "The Historic Machine",
    "Impossible XI",
    "The Invictos",
    "The Forbidden Team",
    "World Cup Legends",
    "Chaos XI",
    "The Ultimate Squad",
  ],
};
