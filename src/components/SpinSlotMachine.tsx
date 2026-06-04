"use client";

import { useEffect, useRef, useState } from "react";
import type { Spin } from "@/types/game";
import { stableHash } from "@/lib/hash";
import { CountryFlag } from "./CountryFlag";

const SPIN_MS = 1900;
const MIN_TICK_MS = 48;
const MAX_TICK_MS = 260;

function pickFromPool(pool: Spin[], seed: string): Spin {
  return pool[stableHash(seed) % pool.length] ?? pool[0]!;
}

export function SpinSlotMachine({
  target,
  pool,
  active,
  onComplete,
  className = "",
}: {
  target: Spin;
  pool: Spin[];
  active: boolean;
  onComplete?: () => void;
  className?: string;
}) {
  const [display, setDisplay] = useState<Spin>(target);
  const [landed, setLanded] = useState(!active);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplay(target);
    setLanded(!active);
  }, [target, active]);

  useEffect(() => {
    if (!active) return;

    doneRef.current = false;
    setLanded(false);
    const start = performance.now();
    let tick = 0;
    let raf = 0;

    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / SPIN_MS);
      const eased = 1 - (1 - progress) ** 3;
      const interval = MIN_TICK_MS + (MAX_TICK_MS - MIN_TICK_MS) * eased;

      if (elapsed >= SPIN_MS) {
        setDisplay(target);
        setLanded(true);
        if (!doneRef.current) {
          doneRef.current = true;
          onCompleteRef.current?.();
        }
        return;
      }

      if (elapsed - tick * interval >= interval || tick === 0) {
        setDisplay(pickFromPool(pool, `spin-${tick}-${Math.floor(elapsed)}`));
        tick++;
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, target, pool]);

  return (
    <div
      className={`paper-texture flex min-h-9 min-w-0 flex-1 items-center gap-1.5 rounded-lg border-2 px-2 py-1 transition-all duration-300 ${
        landed
          ? "border-amber-500/70"
          : "border-amber-700/40 shadow-inner"
      } ${!landed ? "animate-pulse" : ""} ${className}`}
    >
      <CountryFlag country={display.country} size={28} />
      <span
        className={`min-w-0 flex-1 truncate text-sm font-black text-amber-950 ${
          landed ? "opacity-100" : "opacity-80"
        }`}
      >
        {display.country}
      </span>
      <span className="shrink-0 text-[18px] font-bold uppercase tracking-wider text-amber-900/50">
        WC
      </span>
      <span
        className={`shrink-0 text-xl font-black tabular-nums leading-none text-amber-900 ${
          !landed ? "blur-[0.4px]" : ""
        }`}
      >
        {display.worldCup}
      </span>
    </div>
  );
}
