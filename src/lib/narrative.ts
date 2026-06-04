import type { Badge, Language, MatchResult, TeamProfile } from "@/types/simulation";

interface NarrativeInput {
  language: Language;
  badge: Badge;
  formation: string;
  teamProfile: TeamProfile;
  matches: MatchResult[];
  champion: boolean;
  undefeated: boolean;
  goalsFor: number;
  goalsAgainst: number;
  advancedOnPenaltiesFinal: boolean;
}

const TEMPLATES: Record<Language, Record<Badge, string[]>> = {
  es: {
    PERFECT_CHAMPION: [
      "Tu XI arrasó el torneo: siete victorias, cero concesiones de derrota y un {formation} que funcionó como reloj.",
      "Dominio total. El {formation} histórico no dejó respiro a ningún rival.",
    ],
    UNDEFEATED_CHAMPION: [
      "Campeón sin perder: el {formation} resistió cada eliminatoria. {penaltyNote}",
      "Título invicto con un equipo {style}. La defensa aguantó cuando el ataque no brillaba.",
    ],
    CHAMPION: [
      "Campeón del mundo, aunque el camino tuvo tropiezos. El talento del {formation} terminó imponiéndose.",
      "Levantaron la copa tras un Mundial intenso. No fue perfecto, pero fue suficiente.",
    ],
    UNDEFEATED_ELIMINATED: [
      "Invicto en el marcador, eliminado en la historia: penales oportunos cerraron el sueño en {stage}.",
      "Sin derrotas en 90 minutos, pero el torneo terminó antes de la final. Cruel ironía.",
    ],
    ELIMINATED: [
      "El {formation} tenía nombres ilustres, pero el balance no alcanzó para sobrevivir {stage}.",
      "Eliminados. Demasiado ataque, poco control, o simplemente un rival superior.",
    ],
  },
  en: {
    PERFECT_CHAMPION: [
      "Your XI swept the tournament: seven wins, zero losses, and a {formation} that clicked perfectly.",
      "Total dominance. This historic {formation} left no room for rivals.",
    ],
    UNDEFEATED_CHAMPION: [
      "Champions without a loss: the {formation} survived every knockout. {penaltyNote}",
      "Undefeated title with a {style} side. Defense held when attack faded.",
    ],
    CHAMPION: [
      "World champions, though the path had bumps. The {formation}'s talent prevailed in the end.",
      "They lifted the trophy after an intense World Cup. Not perfect, but enough.",
    ],
    UNDEFEATED_ELIMINATED: [
      "Undefeated on the scoreboard, eliminated in history: penalties ended the dream at {stage}.",
      "No losses in 90 minutes, but the tournament ended before the final.",
    ],
    ELIMINATED: [
      "The {formation} had legendary names, but balance wasn't enough to survive {stage}.",
      "Eliminated. Too much attack, too little control, or simply a better opponent.",
    ],
  },
};

function pickTemplate(
  templates: string[],
  seed: string,
): string {
  const idx = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % templates.length;
  return templates[idx] ?? templates[0]!;
}

export function generateNarrative(input: NarrativeInput): string {
  const { language, badge, formation, teamProfile, matches, champion, advancedOnPenaltiesFinal } = input;
  const lastMatch = matches[matches.length - 1];
  const stage = lastMatch?.stage ?? "GROUP_1";
  const stageLabel =
    language === "es"
      ? { GROUP_1: "fase de grupos", GROUP_2: "fase de grupos", GROUP_3: "fase de grupos", R16: "octavos", QF: "cuartos", SF: "semifinal", FINAL: "la final" }[stage]
      : { GROUP_1: "the group stage", GROUP_2: "the group stage", GROUP_3: "the group stage", R16: "the round of 16", QF: "the quarter-finals", SF: "the semi-final", FINAL: "the final" }[stage];

  const style =
    teamProfile.attackPower > teamProfile.defensiveSecurity + 8
      ? language === "es"
        ? "ultraofensivo"
        : "ultra-attacking"
      : teamProfile.defensiveSecurity > teamProfile.attackPower + 8
        ? language === "es"
          ? "defensivo"
          : "defensive"
        : language === "es"
          ? "equilibrado"
          : "balanced";

  const penaltyNote =
    advancedOnPenaltiesFinal
      ? language === "es"
        ? "La final se decidió desde los doce pasos."
        : "The final was decided from the penalty spot."
      : "";

  const seed = `${formation}-${badge}-${matches.length}`;
  const template = pickTemplate(TEMPLATES[language][badge], seed);

  return template
    .replace("{formation}", formation)
    .replace("{style}", style)
    .replace("{stage}", stageLabel ?? stage)
    .replace("{penaltyNote}", penaltyNote)
    .replace(/\s+/g, " ")
    .trim();
}
