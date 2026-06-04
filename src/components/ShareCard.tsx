"use client";

import { useRef, useMemo } from "react";
import type { SavedResult } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { draftedFromSavedResult } from "@/lib/result-draft";
import { FormationPitch } from "./FormationPitch";
import { buildShareCaption, getPublicSiteUrl } from "@/lib/share";
import { SocialShareButtons } from "./SocialShareButtons";

/** Off-screen card captured as PNG: XI + score only (caption is separate). */
function ShareImageCard({
  result,
  drafted,
}: {
  result: SavedResult;
  drafted: ReturnType<typeof draftedFromSavedResult>;
}) {
  const locale = result.language;
  const tr = result.tournament;

  return (
    <div className="paper-texture w-[360px] rounded-2xl border-2 border-amber-800/50 p-5 text-amber-950 shadow-xl">
      <div className="text-center text-[20px] font-bold tracking-[0.2em] text-amber-900/55">
        INVICTOS
      </div>
      <h3 className="mt-1 text-center text-xl font-black leading-tight">
        {result.teamName}
      </h3>
      <p className="text-center text-sm font-bold text-amber-900/80">
        {result.formation}
      </p>

      <div className="mt-4">
        <FormationPitch drafted={drafted} share />
      </div>

      <div className="mt-4 rounded-xl border-2 border-amber-900/25 bg-amber-950/5 py-3 text-center">
        <p className="text-[20px] font-bold uppercase tracking-wider text-amber-900/60">
          Score
        </p>
        <p className="text-5xl font-black leading-none tabular-nums text-amber-950">
          {result.score}
        </p>
        <p className="mt-2 text-sm font-black text-amber-900">
          {t(locale, `badge.${result.badge}`)}
        </p>
        <p className="mt-1 text-[22px] font-bold tabular-nums text-amber-800/90">
          {tr.wins}W · {tr.draws}D · {tr.losses}L · GF {tr.goalsFor}–{tr.goalsAgainst}
        </p>
      </div>
    </div>
  );
}

export function ShareCard({ result }: { result: SavedResult }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const locale = result.language;
  const siteUrl = getPublicSiteUrl();
  const shareCaption = useMemo(() => buildShareCaption(result), [result]);
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

      <p className="text-center text-xs text-[var(--text-muted)]">
        {t(locale, "share.previewHint")}
      </p>

      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)]">
        <ShareImageCard result={result} drafted={drafted} />
      </div>

      <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-center text-xs leading-relaxed text-[var(--text-muted)]">
        {shareCaption.split("\n").map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </p>

      {/* Captured at 2× — positioned off-screen but painted for html-to-image */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 -left-[9999px] -z-50"
        style={{ width: 360 }}
      >
        <div ref={captureRef}>
          <ShareImageCard result={result} drafted={drafted} />
        </div>
      </div>

      <SocialShareButtons
        locale={locale}
        shareCaption={shareCaption}
        cardRef={captureRef}
        resultId={result.id}
      />
    </section>
  );
}
