"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import type { SavedResult } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { getFlagForCountry } from "@/lib/data";

export function ShareCard({ result }: { result: SavedResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = result.language;
  const tr = result.tournament;

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
      ...result.appearances.map(
        (a) => `${getFlagForCountry(a.country)} ${a.displayName}`,
      ),
      t(locale, `badge.${result.badge}`),
      `PJ ${tr.played} | PG ${tr.wins} | PE ${tr.draws} | PP ${tr.losses}`,
      `GF ${tr.goalsFor} | GC ${tr.goalsAgainst} | DG ${tr.goalDifference >= 0 ? "+" : ""}${tr.goalDifference}`,
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
        <ul className="mt-3 space-y-1 text-xs">
          {result.appearances.slice(0, 11).map((a) => (
            <li key={a.id}>
              {getFlagForCountry(a.country)} {a.displayName}
            </li>
          ))}
        </ul>
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
