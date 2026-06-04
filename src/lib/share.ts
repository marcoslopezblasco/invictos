import type { Language } from "@/types/simulation";
import type { SavedResult } from "@/lib/storage";
import { t } from "@/lib/i18n";

/** Canonical production URL when sharing from localhost. */
export const DEFAULT_PUBLIC_SITE_URL = "https://invictos-zeta.vercel.app";

const CAPTION_SUMMARY_MAX = 140;

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

function truncateSummary(text: string, max = CAPTION_SUMMARY_MAX): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function buildQuickSummary(result: SavedResult): string {
  const locale = result.language;
  const tr = result.tournament;
  const badge = t(locale, `badge.${result.badge}`);
  const gd =
    tr.goalDifference >= 0 ? `+${tr.goalDifference}` : `${tr.goalDifference}`;

  if (locale === "es") {
    return `${result.teamName}: ${badge}, ${result.score} pts (${tr.wins} victorias, DG ${gd}).`;
  }
  return `${result.teamName}: ${badge}, ${result.score} pts (${tr.wins} wins, GD ${gd}).`;
}

/** Short caption: one-line result + challenge + link (pairs with share image). */
export function buildShareCaption(result: SavedResult): string {
  const locale = result.language;
  const siteUrl = getPublicSiteUrl();
  const summary = truncateSummary(
    result.tournament.narrative?.trim() || buildQuickSummary(result),
  );

  return `${summary}\n\n${t(locale, "share.challenge")} ${t(locale, "share.playCta")}\n${siteUrl}`;
}

/** @deprecated Use buildShareCaption — kept for tests migrating from long text posts. */
export function buildShareMessage(result: SavedResult): string {
  return buildShareCaption(result);
}

export async function renderShareCardPng(cardEl: HTMLElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  return toPng(cardEl, {
    pixelRatio: 2,
    cacheBust: true,
    skipFonts: false,
  });
}

export function downloadPngDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export type ShareImageOutcome = "shared" | "saved";

export async function shareWithImage(
  cardEl: HTMLElement,
  caption: string,
  filename: string,
): Promise<ShareImageOutcome> {
  const dataUrl = await renderShareCardPng(cardEl);
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const payload = { files: [file], text: caption };
      const canUseFiles =
        !navigator.canShare || navigator.canShare({ files: [file] });
      if (canUseFiles) {
        await navigator.share(payload);
        return "shared";
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "saved";
      }
    }
  }

  downloadPngDataUrl(dataUrl, filename);
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(caption);
  }
  return "saved";
}
