import type { Language } from "@/types/simulation";
import { t } from "@/lib/i18n";

/** Display tiers mapped from hidden OVR (simulation still uses numeric profile). */
const TIER_THRESHOLDS: { min: number; key: string }[] = [
  { min: 95, key: "tier.legend" },
  { min: 90, key: "tier.icon" },
  { min: 85, key: "tier.crack" },
  { min: 80, key: "tier.star" },
  { min: 75, key: "tier.solid" },
  { min: 70, key: "tier.regular" },
  { min: 65, key: "tier.squad" },
  { min: 0, key: "tier.fringe" },
];

export function ovrToTierKey(overall: number): string {
  for (const tier of TIER_THRESHOLDS) {
    if (overall >= tier.min) return tier.key;
  }
  return "tier.fringe";
}

export function tierLabel(locale: Language, overall: number): string {
  return t(locale, ovrToTierKey(overall));
}

/** Tailwind classes for tier badge on player cards */
export function tierBadgeClass(overall: number): string {
  if (overall >= 95) return "bg-amber-400/90 text-amber-950";
  if (overall >= 90) return "bg-violet-500/90 text-white";
  if (overall >= 85) return "bg-orange-500/90 text-white";
  if (overall >= 80) return "bg-sky-600/90 text-white";
  if (overall >= 75) return "bg-emerald-600/80 text-white";
  if (overall >= 70) return "bg-slate-500/80 text-white";
  if (overall >= 65) return "bg-stone-500/70 text-white";
  return "bg-stone-600/50 text-stone-200";
}
