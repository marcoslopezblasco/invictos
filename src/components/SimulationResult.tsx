"use client";

import type { GameMode, Language, TournamentResult } from "@/types/simulation";
import type { DraftedPlayer } from "@/types/simulation";
import { enrichHistoricMatches } from "@/lib/simulation";
import { MatchSchedule } from "./MatchSchedule";

export function SimulationResult({
  tournament,
  locale,
  mode,
  teamName,
  drafted,
}: {
  tournament: TournamentResult;
  locale: Language;
  mode?: GameMode;
  teamName?: string;
  drafted?: DraftedPlayer[];
}) {
  let matches = tournament.matches;

  if (mode === "historico" && teamName && drafted?.length) {
    matches = enrichHistoricMatches(matches, teamName, drafted);
  }

  const showOpponents =
    mode === "historico" || matches.some((m) => m.opponentCountry);

  if (showOpponents) {
    return (
      <MatchSchedule locale={locale} matches={matches} compact showHeading />
    );
  }

  return <MatchSchedule locale={locale} matches={matches} compact abstract />;
}
