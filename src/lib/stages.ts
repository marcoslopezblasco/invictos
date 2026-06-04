import type { Language, MatchStage } from "@/types/simulation";

const STAGE_LABELS: Record<Language, Record<MatchStage, string>> = {
  es: {
    GROUP_1: "Grupo J1",
    GROUP_2: "Grupo J2",
    GROUP_3: "Grupo J3",
    R16: "Octavos",
    QF: "Cuartos",
    SF: "Semifinal",
    FINAL: "Final",
  },
  en: {
    GROUP_1: "Group M1",
    GROUP_2: "Group M2",
    GROUP_3: "Group M3",
    R16: "Round of 16",
    QF: "Quarter-finals",
    SF: "Semi-final",
    FINAL: "Final",
  },
};

export function getStageLabel(locale: Language, stage: MatchStage): string {
  return STAGE_LABELS[locale][stage] ?? stage;
}
