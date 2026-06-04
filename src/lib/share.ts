import type { Language } from "@/types/simulation";
import type { SavedResult } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { getCountryDisplayName } from "@/lib/data";
import { getStageLabel } from "@/lib/stages";

/** Canonical production URL when sharing from localhost. */
export const DEFAULT_PUBLIC_SITE_URL = "https://invictos-zeta.vercel.app";

export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (typeof window === "undefined") {
    return fromEnv ?? DEFAULT_PUBLIC_SITE_URL;
  }
  if (fromEnv) return fromEnv;
  const { hostname, origin } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return DEFAULT_PUBLIC_SITE_URL;
  }
  return origin.replace(/\/$/, "");
}

export function buildShareMessage(result: SavedResult): string {
  const locale = result.language;
  const tr = result.tournament;
  const siteUrl = getPublicSiteUrl();
  const lines = [
    "INVICTOS",
    "",
    `${result.teamName} · ${result.formation}`,
    `${t(locale, `badge.${result.badge}`)} · ${result.score} pts`,
    "",
    `PJ ${tr.played} | PG ${tr.wins} | PE ${tr.draws} | PP ${tr.losses}`,
    `GF ${tr.goalsFor} | GC ${tr.goalsAgainst} | DG ${tr.goalDifference >= 0 ? "+" : ""}${tr.goalDifference}`,
  ];

  if (result.mode === "historico") {
    const fixtures = tr.matches.filter((m) => m.opponentCountry);
    if (fixtures.length) {
      lines.push("");
      for (const m of fixtures) {
        const name = getCountryDisplayName(m.opponentCountry!, locale);
        const yr = m.opponentWorldCup ? ` ${m.opponentWorldCup}` : "";
        const icon = m.result === "W" ? "W" : m.result === "D" ? "D" : "L";
        lines.push(
          `${getStageLabel(locale, m.stage)}: ${icon} vs ${name}${yr} ${m.goalsFor}-${m.goalsAgainst}`,
        );
      }
    }
  }

  lines.push(
    "",
    t(locale, "share.challenge"),
    t(locale, "share.subtitle"),
    siteUrl,
  );

  return lines.join("\n");
}

export function getTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function openShareWindow(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function renderShareCardPng(cardEl: HTMLElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  return toPng(cardEl, { pixelRatio: 2, cacheBust: true });
}

export function downloadPngDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export async function shareToInstagram(
  cardEl: HTMLElement,
  text: string,
  filename: string,
): Promise<"shared" | "saved"> {
  const dataUrl = await renderShareCardPng(cardEl);
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const canUseFiles =
        !navigator.canShare || navigator.canShare({ files: [file] });
      if (canUseFiles) {
        await navigator.share({ files: [file], text });
        return "shared";
      }
      await navigator.share({ text, url: getPublicSiteUrl() });
      downloadPngDataUrl(dataUrl, filename);
      return "saved";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "saved";
      }
    }
  }

  downloadPngDataUrl(dataUrl, filename);
  await navigator.clipboard.writeText(text);
  return "saved";
}
