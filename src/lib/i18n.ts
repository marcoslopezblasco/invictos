import type { Language } from "@/types/simulation";
import type { Position } from "@/types/player";

export type Locale = Language;

const translations: Record<Locale, Record<string, string>> = {
  es: {
    "nav.home": "Inicio",
    "nav.exitDraft": "Abandonar partida",
    "nav.exitDraftConfirm": "¿Abandonar esta partida? Perderás el progreso del draft.",
    "lang.es": "Español",
    "lang.en": "English",
    "app.title": "Invictos",
    "app.claim":
      "Draftea un XI histórico. Simula un Mundial. Descubre si puedes ganarlo invicto.",
    "app.loading": "Cargando…",
    "home.play": "Jugar",
    "home.playAs": "Jugar — {mode}",
    "home.how": "Cómo funciona",
    "home.classic": "Clásico",
    "home.blind": "Blind",
    "home.historico": "Histórico",
    "home.hardcore": "Hardcore",
    "home.modeLabel": "Modo de juego",
    "home.mode.classic.desc":
      "Modo estándar: ves país, mundial, partidos y categoría en cada carta. Rivales más duros en la simulación que en Blind.",
    "home.mode.blind.desc":
      "Draft a ciegas: solo nombre y posición en la carta (el giro sigue mostrando país y mundial). Sin categoría ni stats — puro instinto.",
    "home.mode.historico.desc":
      "Cartas como Clásico; en el torneo cada fase enfrenta una selección real (país y año del rival).",
    "home.mode.hardcore.desc":
      "Como Clásico, con regla extra: cada país solo puede salir una vez. Tras fichar, ese país desaparece del rollo.",
    "draft.hardcoreHint":
      "Cada país solo puede salir una vez: al fichar un jugador, ese país desaparece del rollo.",
    "sim.vs": "vs",
    "sim.pen": "pen",
    "sim.win": "Victoria",
    "sim.draw": "Empate",
    "sim.loss": "Derrota",
    "sim.fixtures": "Partidos",
    "sim.fixturesPreview": "Tu camino al título",
    "sim.fixturesHint":
      "Rivales fijos para esta simulación (mezcla de distintos Mundiales).",
    "name.title": "¿Cómo se llama tu XI?",
    "name.placeholder": "Los Invictos de Marcos",
    "name.start": "Empezar draft",
    "name.random": "Nombre aleatorio",
    "draft.pick": "Fichaje",
    "draft.rerolls": "Rerolls",
    "draft.choose": "Elige un jugador",
    "draft.reroll": "Reroll",
    "draft.noRerolls": "Sin rerolls",
    "draft.roll": "ROLL",
    "draft.rolling": "Girando…",
    "draft.rollHint": "Gira país y mundial para abrir el primer fichaje",
    "draft.filterAll": "Todos",
    "draft.sortFit": "Mejor encaje",
    "draft.sortOvr": "Categoría",
    "draft.sortPosition": "Posición",
    "draft.filterEmpty": "Ningún jugador cumple el filtro",
    "draft.filtersToggle": "Filtros y orden",
    "draft.urgency": "Necesitas {need} {position} en {picks} fichajes",
    "card.pos": "Pos",
    "card.worldCups": "Mundiales",
    "card.matches": "Partidos",
    "card.wcShort": "Mund.",
    "card.matchesShort": "PJ",
    "spin.wcLabel": "Mund.",
    "tier.legend": "Leyenda",
    "tier.icon": "Icono",
    "tier.crack": "Figura",
    "tier.star": "Beast",
    "tier.solid": "Sólido",
    "tier.regular": "Regular",
    "tier.squad": "Titular",
    "tier.fringe": "Flojo",
    "draft.filter": "Filtrar",
    "draft.sort": "Ordenar",
    "result.playAgain": "Jugar de nuevo",
    "result.score": "Puntuación",
    "result.notFound": "No encontramos esta partida en este dispositivo.",
    "result.statsLine":
      "PJ {played} · PG {wins} · PE {draws} · PP {losses}",
    "result.goalsLine": "GF {gf} · GC {gc} · DG {gd}",
    "draft.yourXi": "Tu XI",
    "draft.formation": "Formación",
    "slots.gk": "GK",
    "slots.def": "DEF",
    "slots.mid": "MID",
    "slots.fwd": "FWD",
    "slots.att": "ATT",
    "review.title": "Tu XI está listo",
    "review.simulate": "Simular Mundial",
    "review.noDraft": "No hay un draft en curso.",
    "review.hint": "El motor premia el balance del XI, no solo las estrellas.",
    "review.formation": "Formación",
    "review.attack": "Ataque",
    "review.defense": "Defensa",
    "review.midfield": "Mediocampo",
    "review.balance": "Balance",
    "result.share": "Compartir",
    "result.copy": "Copiar texto",
    "share.challengeLabel": "Desafío",
    "share.challenge": "¿Puedes ganarle a mi equipo?",
    "share.playCta": "Juega en Invictos →",
    "share.subtitle": "Arma tu XI histórico y simula un Mundial en Invictos.",
    "share.previewHint": "La imagen incluye tu XI y puntuación; el texto va aparte.",
    "share.imageShared": "Imagen y texto listos para publicar.",
    "share.imageFallback":
      "Imagen guardada y texto copiado. Adjúntalos en tu red social.",
    "share.imageSaved": "Imagen guardada.",
    "share.twitter": "Compartir en X",
    "share.whatsapp": "Compartir en WhatsApp",
    "share.instagram": "Compartir en Instagram",
    "share.saveImage": "Guardar imagen",
    "share.copied": "Texto copiado — pégalo donde quieras.",
    "share.instagramError": "No se pudo compartir. Prueba guardar la imagen.",
    "share.statsCompact": "{wins}V · {draws}E · {losses}D · GF {gf}–{gc}",
    "badge.PERFECT_CHAMPION": "Campeón perfecto",
    "badge.UNDEFEATED_CHAMPION": "Campeón invicto",
    "badge.CHAMPION": "Campeón",
    "badge.UNDEFEATED_ELIMINATED": "Invicto eliminado",
    "badge.ELIMINATED": "Eliminado",
    "badge.hint.PERFECT_CHAMPION": "7 victorias, 0 empates, 0 derrotas",
    "badge.hint.UNDEFEATED_CHAMPION": "Campeón del Mundial invicto",
    "badge.hint.CHAMPION": "Campeón con al menos una derrota en fase de grupos",
    "badge.hint.UNDEFEATED_ELIMINATED": "Invicto en el marcador, eliminado en eliminatorias",
    "badge.hint.ELIMINATED": "Eliminado antes del título",
    "how.title": "Cómo funciona",
    "how.intro":
      "Gira país y mundial, elige 11 jugadores y simula un Mundial de 7 partidos. El objetivo: ganarlo invicto.",
    "how.section.modes": "Modos",
    "how.modes.classic":
      "Clásico: cartas con mundiales, partidos y categoría. Rivales más exigentes en la simulación.",
    "how.modes.blind":
      "Blind: en la carta solo nombre y posición; el giro sigue mostrando país y mundial.",
    "how.modes.historico":
      "Histórico: cartas como Clásico; cada fase enfrenta una selección real.",
    "how.modes.hardcore":
      "Hardcore: como Clásico, pero cada país solo puede salir una vez en el draft.",
    "how.section.draft": "Draft",
    "how.draft.body":
      "11 fichajes. 3 rerolls (cambian país + mundial, no consumen fichaje). No puedes repetir jugador. Mínimos: 1 GK, 3 DEF, 3 MID, 1 FWD.",
    "how.section.sim": "Simulación",
    "how.sim.body":
      "Motor determinista: mismo XI = mismo resultado. Empates y penales pueden aparecer; ganar invicto exige no perder en los 90 minutos.",
    "how.section.share": "Compartir",
    "how.share.body":
      "Al terminar, comparte imagen y texto. Las partidas se guardan solo en este dispositivo.",
    "recent.title": "Partidas recientes",
    "recent.localOnly": "Solo en este dispositivo",
  },
  en: {
    "nav.home": "Home",
    "nav.exitDraft": "Leave draft",
    "nav.exitDraftConfirm": "Leave this draft? You will lose your progress.",
    "lang.es": "Español",
    "lang.en": "English",
    "app.title": "Invictos",
    "app.claim":
      "Draft a historic XI. Simulate a World Cup. See if you can win it invicto.",
    "app.loading": "Loading…",
    "home.play": "Play",
    "home.playAs": "Play — {mode}",
    "home.how": "How it works",
    "home.classic": "Classic",
    "home.blind": "Blind",
    "home.historico": "Historic",
    "home.hardcore": "Hardcore",
    "home.modeLabel": "Game mode",
    "home.mode.classic.desc":
      "Standard mode: country, World Cup, matches, and tier on every card. Tougher simulation opponents than Blind.",
    "home.mode.blind.desc":
      "Blind draft: name and position on the card only (the spin still shows country and World Cup). No tier or stats — pure instinct.",
    "home.mode.historico.desc":
      "Classic-style cards; each round faces a real national team (opponent country and year).",
    "home.mode.hardcore.desc":
      "Like Classic, plus one rule: each country can only appear once. After you pick, that nation leaves the wheel.",
    "draft.hardcoreHint":
      "Each country can only appear once: after you pick a player, that nation leaves the wheel.",
    "sim.vs": "vs",
    "sim.pen": "pen",
    "sim.win": "Win",
    "sim.draw": "Draw",
    "sim.loss": "Loss",
    "sim.fixtures": "Matches",
    "sim.fixturesPreview": "Your path to the title",
    "sim.fixturesHint": "Fixed opponents for this run (teams from different World Cups).",
    "name.title": "What is your XI called?",
    "name.placeholder": "Marco's Invictos",
    "name.start": "Start draft",
    "name.random": "Random name",
    "draft.pick": "Pick",
    "draft.rerolls": "Rerolls",
    "draft.choose": "Choose a player",
    "draft.reroll": "Reroll",
    "draft.noRerolls": "No rerolls left",
    "draft.roll": "ROLL",
    "draft.rolling": "Rolling…",
    "draft.rollHint": "Roll country and World Cup to start the draft",
    "draft.filterAll": "All",
    "draft.sortFit": "Best fit",
    "draft.sortOvr": "Tier",
    "draft.sortPosition": "Position",
    "draft.filterEmpty": "No players match this filter",
    "draft.filtersToggle": "Filters & sort",
    "draft.urgency": "Need {need} {position} in {picks} picks",
    "card.pos": "Pos",
    "card.worldCups": "World Cups",
    "card.matches": "Matches",
    "card.wcShort": "WC",
    "card.matchesShort": "GP",
    "spin.wcLabel": "WC",
    "tier.legend": "Legend",
    "tier.icon": "Icon",
    "tier.crack": "Crack",
    "tier.star": "Beast",
    "tier.solid": "Solid",
    "tier.regular": "Regular",
    "tier.squad": "Starter",
    "tier.fringe": "Weak",
    "draft.filter": "Filter",
    "draft.sort": "Sort",
    "result.playAgain": "Play again",
    "result.score": "Score",
    "result.notFound": "We could not find this game on this device.",
    "result.statsLine": "P {played} · W {wins} · D {draws} · L {losses}",
    "result.goalsLine": "GF {gf} · GA {gc} · GD {gd}",
    "draft.yourXi": "Your XI",
    "draft.formation": "Formation",
    "slots.gk": "GK",
    "slots.def": "DEF",
    "slots.mid": "MID",
    "slots.fwd": "FWD",
    "slots.att": "ATT",
    "review.title": "Your XI is ready",
    "review.simulate": "Simulate World Cup",
    "review.noDraft": "No draft in progress.",
    "review.hint": "The engine rewards XI balance, not just star power.",
    "review.formation": "Formation",
    "review.attack": "Attack",
    "review.defense": "Defense",
    "review.midfield": "Midfield",
    "review.balance": "Balance",
    "result.share": "Share",
    "result.copy": "Copy text",
    "share.challengeLabel": "Challenge",
    "share.challenge": "Can you beat my team?",
    "share.playCta": "Play on Invictos →",
    "share.subtitle": "Draft a historic XI and simulate a World Cup on Invictos.",
    "share.previewHint": "The image shows your XI and score; text is shared separately.",
    "share.imageShared": "Image and caption ready to post.",
    "share.imageFallback":
      "Image saved and caption copied. Attach them in your app.",
    "share.imageSaved": "Image saved.",
    "share.twitter": "Share on X",
    "share.whatsapp": "Share on WhatsApp",
    "share.instagram": "Share on Instagram",
    "share.saveImage": "Save image",
    "share.copied": "Text copied — paste it anywhere.",
    "share.instagramError": "Could not share. Try saving the image.",
    "share.statsCompact": "{wins}W · {draws}D · {losses}L · GF {gf}–{gc}",
    "badge.PERFECT_CHAMPION": "Perfect champion",
    "badge.UNDEFEATED_CHAMPION": "Invicto champion",
    "badge.CHAMPION": "Champion",
    "badge.UNDEFEATED_ELIMINATED": "Invicto eliminated",
    "badge.ELIMINATED": "Eliminated",
    "badge.hint.PERFECT_CHAMPION": "7 wins, 0 draws, 0 losses",
    "badge.hint.UNDEFEATED_CHAMPION": "Won the World Cup invicto",
    "badge.hint.CHAMPION": "Champion with at least one group-stage loss",
    "badge.hint.UNDEFEATED_ELIMINATED": "Invicto in the table, knocked out in knockouts",
    "badge.hint.ELIMINATED": "Eliminated before the title",
    "how.title": "How it works",
    "how.intro":
      "Roll country and World Cup, draft 11 players, and simulate a 7-match World Cup. Goal: win it invicto.",
    "how.section.modes": "Modes",
    "how.modes.classic":
      "Classic: cards show World Cups, matches, and tier. Tougher simulation opponents.",
    "how.modes.blind":
      "Blind: cards show name and position only; the spin still shows country and World Cup.",
    "how.modes.historico":
      "Historic: Classic cards; each round faces a real national team.",
    "how.modes.hardcore":
      "Hardcore: like Classic, but each country can only appear once in the draft.",
    "how.section.draft": "Draft",
    "how.draft.body":
      "11 picks. 3 rerolls (new country + World Cup, no pick spent). No duplicate players. Minimums: 1 GK, 3 DEF, 3 MID, 1 FWD.",
    "how.section.sim": "Simulation",
    "how.sim.body":
      "Deterministic engine: same XI = same result. Draws and penalties can happen; winning invicto means no losses in 90 minutes.",
    "how.section.share": "Share",
    "how.share.body":
      "When you finish, share image and caption. Games are stored on this device only.",
    "recent.title": "Recent games",
    "recent.localOnly": "This device only",
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

export function tFormat(
  locale: Locale,
  key: string,
  vars: Record<string, string | number>,
): string {
  let s = t(locale, key);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

const POSITION_LABEL_KEYS: Record<Position, string> = {
  GK: "slots.gk",
  DEF: "slots.def",
  MID: "slots.mid",
  FWD: "slots.fwd",
};

export function positionLabel(locale: Locale, position: Position): string {
  return t(locale, POSITION_LABEL_KEYS[position]);
}

export function formatPositionUrgency(
  locale: Locale,
  position: Position,
  need: number,
  picksLeft: number,
): string {
  return tFormat(locale, "draft.urgency", {
    need,
    position: positionLabel(locale, position),
    picks: picksLeft,
  });
}

export function modeLabelKey(
  mode: "classic" | "blind" | "historico" | "hardcore",
): string {
  if (mode === "classic") return "home.classic";
  if (mode === "blind") return "home.blind";
  if (mode === "historico") return "home.historico";
  return "home.hardcore";
}

export function pickRandomTeamName(locale: Locale): string {
  const names = RANDOM_TEAM_NAMES[locale];
  return names[Math.floor(Math.random() * names.length)]!;
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
