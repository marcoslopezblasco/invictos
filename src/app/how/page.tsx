"use client";

import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { t } from "@/lib/i18n";

export default function HowPage() {
  const { locale } = useGame();

  const sections = [
    { titleKey: "how.section.modes", bodyKeys: ["how.modes.classic", "how.modes.blind", "how.modes.historico", "how.modes.hardcore"] },
    { titleKey: "how.section.draft", bodyKeys: ["how.draft.body"] },
    { titleKey: "how.section.sim", bodyKeys: ["how.sim.body"] },
    { titleKey: "how.section.share", bodyKeys: ["how.share.body"] },
  ] as const;

  return (
    <div className="px-4 py-8">
      <Link href="/" className="text-sm text-[var(--text-muted)]">
        ← {t(locale, "app.title")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t(locale, "how.title")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
        {t(locale, "how.intro")}
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {sections.map(({ titleKey, bodyKeys }) => (
          <section key={titleKey}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--accent-gold)]">
              {t(locale, titleKey)}
            </h2>
            <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {bodyKeys.map((key) => (
                <li key={key}>{t(locale, key)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
