"use client";

import type { DraftedPlayer } from "@/types/simulation";
import { buildTeamProfile } from "@/lib/scoring";
import { CountryFlag } from "./CountryFlag";

export function TeamSummary({
  drafted,
  teamName,
}: {
  drafted: DraftedPlayer[];
  teamName: string;
}) {
  const profile = buildTeamProfile(drafted);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">{teamName}</h2>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="text-sm text-[var(--text-muted)]">Formation</div>
        <div className="text-2xl font-black text-[var(--accent-gold)]">
          {profile.formation}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div>Attack: {Math.round(profile.attackPower)}</div>
          <div>Defense: {Math.round(profile.defensiveSecurity)}</div>
          <div>Midfield: {Math.round(profile.midfieldControl)}</div>
          <div>Balance: {Math.round(profile.balance)}</div>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {drafted.map((d) => (
          <li
            key={d.appearance.id}
            className="card-sticker flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          >
            <CountryFlag country={d.appearance.country} size={18} />
            <span className="font-bold">{d.appearance.displayName}</span>
            <span className="text-amber-900/60">
              {d.appearance.position} · {d.appearance.country}{" "}
              {d.appearance.worldCup}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
