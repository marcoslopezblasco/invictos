"use client";

import { useRef, useMemo } from "react";
import type { SavedResult } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { getCountryDisplayName } from "@/lib/data";
import { getStageLabel } from "@/lib/stages";
import { draftedFromSavedResult } from "@/lib/result-draft";
import { FormationPitch } from "./FormationPitch";
import { buildShareMessage, getPublicSiteUrl } from "@/lib/share";
import { SocialShareButtons } from "./SocialShareButtons";

export function ShareCard({ result }: { result: SavedResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = result.language;
  const tr = result.tournament;
  const siteUrl = getPublicSiteUrl();
  const shareText = useMemo(() => buildShareMessage(result), [result]);
  const drafted = useMemo(
    () => draftedFromSavedResult(result),
    [result],
  );

  const displayHost = siteUrl.replace(/^https?:\/\//, "");

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[var(--accent-gold)]/30 bg-[var(--bg-card)] p-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">
          {t(locale, "share.challengeLabel")}
        </p>
        <h2 className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl">
          {t(locale, "share.challenge")}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {t(locale, "share.subtitle")}
        </p>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-bold text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-4"
        >
          {displayHost} →
        </a>
      </div>

      <div
        ref={ref}
        className="paper-texture mx-auto w-full max-w-sm rounded-2xl border-2 border-amber-800/40 p-5 text-amber-950 shadow-lg"
      >
        <div className="text-center text-xs font-bold tracking-widest text-amber-900/60">
          INVICTOS
        </div>
        <h3 className="mt-1 text-center text-lg font-black">{result.teamName}</h3>
        <p className="text-center text-sm font-bold">{result.formation}</p>
        <div className="mt-3">
          <FormationPitch drafted={drafted} compact />
        </div>
        <div className="mt-4 text-center text-sm font-black text-amber-900">
          🏆 {t(locale, `badge.${result.badge}`)}
        </div>
        <p className="mt-1 text-center text-xs font-bold tabular-nums text-amber-800">
          {result.score} pts
        </p>
        <p className="mt-2 text-center text-xs font-mono">
          PJ {tr.played} | PG {tr.wins} | PE {tr.draws} | PP {tr.losses}
        </p>
        <p className="text-center text-xs font-mono">
          GF {tr.goalsFor} | GC {tr.goalsAgainst} | DG{" "}
          {tr.goalDifference >= 0 ? "+" : ""}
          {tr.goalDifference}
        </p>
        {result.mode === "historico" && (
          <ul className="mt-3 space-y-1 text-left text-[10px] font-semibold text-amber-900/80">
            {tr.matches
              .filter((m) => m.opponentCountry)
              .map((m) => (
                <li key={m.stage} className="flex justify-between gap-2">
                  <span>
                    {getStageLabel(locale, m.stage)} vs{" "}
                    {getCountryDisplayName(m.opponentCountry!, locale)}
                    {m.opponentWorldCup ? ` ${m.opponentWorldCup}` : ""}
                  </span>
                  <span className="font-mono">
                    {m.result === "W" ? "✓" : m.result === "D" ? "=" : "✗"}{" "}
                    {m.goalsFor}-{m.goalsAgainst}
                  </span>
                </li>
              ))}
          </ul>
        )}
        <div className="mt-4 rounded-xl border border-amber-900/20 bg-amber-950/5 px-3 py-3 text-center">
          <p className="text-sm font-black leading-snug text-amber-950">
            {t(locale, "share.challenge")}
          </p>
          <p className="mt-1 text-[11px] font-bold text-amber-900/70">{displayHost}</p>
        </div>
      </div>

      <SocialShareButtons
        locale={locale}
        shareText={shareText}
        cardRef={ref}
        resultId={result.id}
      />
    </section>
  );
}
