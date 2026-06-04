"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { TeamSummary } from "@/components/TeamSummary";
import { t } from "@/lib/i18n";
import { loadData, getAppearancesById } from "@/lib/data";
import { picksToDrafted } from "@/lib/draft";
import { TOTAL_PICKS } from "@/types/game";

export default function ReviewPage() {
  const router = useRouter();
  const { gameState, runSimulation, locale } = useGame();
  const indexes = useMemo(() => loadData(), []);
  const appearancesById = useMemo(() => getAppearancesById(), []);

  if (!gameState || gameState.picks.length < TOTAL_PICKS) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-[var(--text-muted)]">No draft in progress.</p>
        <Link href="/play" className="mt-4 inline-block text-[var(--accent)]">
          {t(locale, "home.play")}
        </Link>
      </div>
    );
  }

  const drafted = picksToDrafted(
    gameState.picks,
    appearancesById,
    indexes.playersById,
  );

  const handleSimulate = () => {
    const saved = runSimulation();
    if (saved) router.push(`/result/${saved.id}`);
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <h1 className="text-xl font-bold">{t(locale, "review.title")}</h1>
      <TeamSummary drafted={drafted} teamName={gameState.teamName} />
      <button
        type="button"
        onClick={handleSimulate}
        className="rounded-2xl bg-[var(--accent-gold)] py-4 text-lg font-black text-black"
      >
        {t(locale, "review.simulate")}
      </button>
    </div>
  );
}
