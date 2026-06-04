"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import type { SavedResult } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { getFlagCodeForCountry } from "@/lib/data";
import { draftedFromSavedResult } from "@/lib/result-draft";
import { FormationPitch } from "./FormationPitch";
import { useMemo } from "react";
import { getCountryDisplayName } from "@/lib/data";
import { getStageLabel } from "./MatchSchedule";

export function ShareCard({ result }: { result: SavedResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = result.language;
  const tr = result.tournament;
  const drafted = useMemo(
    () => draftedFromSavedResult(result),
    [result],
  );

  const downloadImage = async () => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `invictos-${result.id}.png`;
    a.click();
  };

  const copyText = () => {
    const lines = [
      "INVICTOS",
      result.teamName,
      result.formation,
      ...result.appearances.map((a) => {
        const code = getFlagCodeForCountry(a.country);
        const prefix = code ? `[${code.toUpperCase()}]` : a.country;
        return `${prefix} ${a.displayName}`;
      }),
      t(locale, `badge.${result.badge}`),
      `PJ ${tr.played} | PG ${tr.wins} | PE ${tr.draws} | PP ${tr.losses}`,
      `GF ${tr.goalsFor} | GC ${tr.goalsAgainst} | DG ${tr.goalDifference >= 0 ? "+" : ""}${tr.goalDifference}`,
      ...(result.mode === "historico"
        ? tr.matches
            .filter((m) => m.opponentCountry)
            .map(
              (m) =>
                `${getStageLabel(locale, m.stage)}: ${getCountryDisplayName(m.opponentCountry!, locale)} ${m.goalsFor}-${m.goalsAgainst}`,
            )
        : []),
      t(locale, "share.cta"),
      "invictos.app",
    ];
    navigator.clipboard.writeText(lines.join("\n"));
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        className="paper-texture mx-auto w-full max-w-sm rounded-2xl border-2 border-amber-800/40 p-5 text-amber-950"
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
                  </span>
                  <span className="font-mono">
                    {m.goalsFor}-{m.goalsAgainst}
                  </span>
                </li>
              ))}
          </ul>
        )}
        <p className="mt-3 text-center text-xs font-semibold">
          {t(locale, "share.cta")}
        </p>
        <p className="text-center text-[10px] text-amber-900/50">invictos.app</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copyText}
          className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-semibold"
        >
          {t(locale, "result.copy")}
        </button>
        <button
          type="button"
          onClick={downloadImage}
          className="flex-1 rounded-xl bg-[var(--accent)] py-3 text-sm font-bold text-white"
        >
          {t(locale, "result.share")}
        </button>
      </div>
    </div>
  );
}
